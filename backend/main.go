package main

import (
	"context"
	"crypto/rand"
	"embed"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/time/rate"
)

//go:embed admin/*
var adminFS embed.FS

type App struct {
	DB       *pgxpool.Pool
	RDB      *redis.Client
	Limiters sync.Map // key: ip -> *rate.Limiter
	JWTSecret string
	Upgrader websocket.Upgrader
	Clients  map[string]*websocket.Conn
	ClientsMu sync.RWMutex
}

func main() {
	port := getenv("PORT", "8080")
	frontendOrigin := getenv("FRONTEND_ORIGIN", "http://localhost:3000")

	ctx := context.Background()

	// DB
	dbURL := os.Getenv("DATABASE_URL")
	var db *pgxpool.Pool
	var err error
	if dbURL != "" {
		db, err = pgxpool.New(ctx, dbURL)
		if err != nil {
			log.Fatalf("failed to init db: %v", err)
		}
	}

	// Redis
	redisURL := os.Getenv("REDIS_URL")
	var rdb *redis.Client
	if redisURL != "" {
		opt, err := redis.ParseURL(redisURL)
		if err != nil {
			log.Fatalf("failed to parse redis url: %v", err)
		}
		rdb = redis.NewClient(opt)
	}

	jwtSecret := getenv("JWT_SECRET", generateRandomSecret())
	app := &App{
		DB: db, 
		RDB: rdb,
		JWTSecret: jwtSecret,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool { return true },
		},
		Clients: make(map[string]*websocket.Conn),
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(requestLogger())
	r.Use(app.rateLimitMiddleware(20, time.Minute)) // 20 req/min/IP
	r.Use(app.securityMiddleware())
	r.Use(app.metricsMiddleware())

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontendOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Metrics
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Health
	r.GET("/api/health", app.healthHandler)

	// Dynamic Auth endpoints
	auth := r.Group("/api/auth")
	auth.POST("/login", app.loginHandler)
	auth.POST("/register", app.registerHandler)
	auth.POST("/refresh", app.authRequired(), app.refreshHandler)
	auth.POST("/logout", app.authRequired(), app.logoutHandler)
	auth.GET("/profile", app.authRequired(), app.profileHandler)

	// Dynamic Users API
	users := r.Group("/api/users")
	users.GET("/me", app.authRequired(), app.meHandler)
	users.GET("/", app.listUsers)
	users.GET("/search", app.searchUsers)
	users.PUT("/me", app.authRequired(), app.updateProfile)
	users.GET("/:id", app.getUserByID)
	users.POST("/:id/follow", app.authRequired(), app.followUser)
	users.DELETE("/:id/follow", app.authRequired(), app.unfollowUser)

	// Messages (example CRUD)
	msg := r.Group("/api/messages", app.authRequired())
	msg.GET("", app.listMessages)
	msg.POST("", app.createMessage)

	// Dynamic Social API
	social := r.Group("/api/social")
	social.GET("/feed", app.authRequired(), app.feedHandler)
	social.GET("/posts", app.listPosts)
	social.POST("/posts", app.authRequired(), app.createPost)
	social.GET("/posts/:id", app.getPost)
	social.PUT("/posts/:id", app.authRequired(), app.updatePost)
	social.DELETE("/posts/:id", app.authRequired(), app.deletePost)
	social.POST("/posts/:id/react", app.authRequired(), app.reactPost)
	social.GET("/posts/:id/reactions", app.getPostReactions)
	social.POST("/posts/:id/comments", app.authRequired(), app.addComment)
	social.GET("/posts/:id/comments", app.getComments)

	// Real-time WebSocket
	r.GET("/ws", app.wsHandler)
	r.GET("/api/stats/live", app.liveStatsHandler)

	// Configuration endpoints
	config := r.Group("/api/config")
	config.GET("/", app.getConfigHandler)
	config.PUT("/", app.authRequired(), app.updateConfigHandler)

	// Admin Dashboard (static)
	r.GET("/admin", app.adminIndex)
	r.GET("/admin/stats", app.adminStats)

	log.Printf("server listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

func getenv(k, def string) string { if v := os.Getenv(k); v != "" { return v }; return def }

func generateRandomSecret() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func requestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		lat := time.Since(start)
		log.Printf("%s %s %d %s [%s]", c.Request.Method, c.Request.URL.Path, c.Writer.Status(), lat, clientIP(c.Request))
	}
}

// Security middleware
func (a *App) securityMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Security headers
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Content-Security-Policy", "default-src 'self'")
		c.Next()
	}
}

// Metrics middleware
func (a *App) metricsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		duration := time.Since(start)
		
		// Log slow requests
		if duration > 1*time.Second {
			log.Printf("SLOW REQUEST: %s %s took %v", c.Request.Method, c.Request.URL.Path, duration)
		}
	}
}

func (a *App) rateLimitMiddleware(reqPerWindow int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := clientIP(c.Request)
		limiterIface, _ := a.Limiters.LoadOrStore(ip, rate.NewLimiter(rate.Every(window/time.Duration(reqPerWindow)), reqPerWindow))
		limiter := limiterIface.(*rate.Limiter)
		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "rate limit exceeded"})
			return
		}
		c.Next()
	}
}

func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		parts := strings.Split(xff, ",")
		return strings.TrimSpace(parts[0])
	}
	ip := r.RemoteAddr
	if i := strings.LastIndex(ip, ":"); i != -1 { ip = ip[:i] }
	return ip
}

// Handlers
func (a *App) healthHandler(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()

	status := gin.H{"status": "ok", "time": time.Now()}
	if a.DB != nil {
		if err := a.DB.Ping(ctx); err != nil { status["db"] = "down" } else { status["db"] = "up" }
	} else { status["db"] = "not_configured" }
	if a.RDB != nil {
		if err := a.RDB.Ping(ctx).Err(); err != nil { status["redis"] = "down" } else { status["redis"] = "up" }
	} else { status["redis"] = "not_configured" }
	c.JSON(http.StatusOK, status)
}

// Dynamic authentication handlers
func (a *App) loginHandler(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Find user by email
	user, exists := findUserByEmail(req.Email)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	// Generate JWT token
	token, err := a.generateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	// Update last login
	user.LastLogin = time.Now()
	updateUser(user)

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id": user.ID,
			"name": user.Name,
			"email": user.Email,
			"avatar": user.Avatar,
		},
	})
}

func (a *App) registerHandler(c *gin.Context) {
	var req struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Check if user already exists
	if _, exists := findUserByEmail(req.Email); exists {
		c.JSON(http.StatusConflict, gin.H{"error": "user already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	// Create new user
	user := &User{
		ID:           generateID("user"),
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Avatar:       fmt.Sprintf("https://ui-avatars.com/api/?name=%s&background=FF6B00&color=fff", req.Name),
		CreatedAt:    time.Now(),
		LastLogin:    time.Now(),
		IsActive:     true,
	}

	// Save user
	createUser(user)

	// Generate JWT token
	token, err := a.generateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user": gin.H{
			"id": user.ID,
			"name": user.Name,
			"email": user.Email,
			"avatar": user.Avatar,
		},
	})
}

func (a *App) refreshHandler(c *gin.Context) {
	userID := c.GetString("userID")
	token, err := a.generateJWT(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}

// Dynamic JWT authentication middleware
func (a *App) authRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}
		tokenString := strings.TrimSpace(strings.TrimPrefix(auth, "Bearer "))

		// Parse and validate JWT token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(a.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		// Extract user ID from claims
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			userID := claims["user_id"].(string)
			// Verify user still exists and is active
			user, exists := findUserByID(userID)
			if !exists || !user.IsActive {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user not found or inactive"})
				return
			}
			c.Set("userID", userID)
			c.Set("user", user)
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
			return
		}

		c.Next()
	}
}

// Dynamic current user endpoint
func (a *App) meHandler(c *gin.Context) {
	userID := c.GetString("userID")
	user, exists := findUserByID(userID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// Message model (in-memory demo)
type Message struct { ID string `json:"id"`; Text string `json:"text"`; CreatedAt time.Time `json:"createdAt"`; AuthorID string `json:"authorId"` }
var messages = []Message{}

func (a *App) listMessages(c *gin.Context) { c.JSON(http.StatusOK, messages) }
func (a *App) createMessage(c *gin.Context) {
	var req struct{ Text string `json:"text"` }
	if err := c.BindJSON(&req); err != nil || strings.TrimSpace(req.Text) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"}); return
	}
	msg := Message{ID: fmt.Sprintf("m-%d", time.Now().UnixNano()), Text: req.Text, CreatedAt: time.Now(), AuthorID: c.GetString("userID")}
	messages = append(messages, msg)
	c.JSON(http.StatusCreated, msg)
}

// Real-time WebSocket handler
func (a *App) wsHandler(c *gin.Context) {
	conn, err := a.Upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	// Get user ID from query params or token
	userID := c.Query("user_id")
	if userID == "" {
		userID = "anonymous"
	}

	// Store connection
	a.ClientsMu.Lock()
	a.Clients[userID] = conn
	a.ClientsMu.Unlock()

	// Remove connection on disconnect
	defer func() {
		a.ClientsMu.Lock()
		delete(a.Clients, userID)
		a.ClientsMu.Unlock()
	}()

	// Handle messages
	for {
		var msg map[string]interface{}
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("WebSocket read error: %v", err)
			break
		}

		// Broadcast message to all connected clients
		a.broadcastMessage(msg)
	}
}

// Broadcast message to all connected clients
func (a *App) broadcastMessage(msg map[string]interface{}) {
	a.ClientsMu.RLock()
	defer a.ClientsMu.RUnlock()

	for userID, conn := range a.Clients {
		err := conn.WriteJSON(msg)
		if err != nil {
			log.Printf("WebSocket write error for user %s: %v", userID, err)
			// Remove failed connection
			go func(id string) {
				a.ClientsMu.Lock()
				delete(a.Clients, id)
				a.ClientsMu.Unlock()
			}(userID)
		}
	}
}

// Admin UI
func (a *App) adminIndex(c *gin.Context) {
	b, err := adminFS.ReadFile("admin/index.html")
	if err != nil { c.String(http.StatusInternalServerError, "missing admin ui"); return }
	c.Data(http.StatusOK, "text/html; charset=utf-8", b)
}

func (a *App) adminStats(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 2*time.Second)
	defer cancel()
	resp := gin.H{"version": "v0.1.0", "time": time.Now()}
	if a.DB != nil { if err := a.DB.Ping(ctx); err != nil { resp["db"] = "down" } else { resp["db"] = "up" } } else { resp["db"] = "not_configured" }
	if a.RDB != nil { if err := a.RDB.Ping(ctx).Err(); err != nil { resp["redis"] = "down" } else { resp["redis"] = "up" } } else { resp["redis"] = "not_configured" }
	resp["messages_count"] = len(messages)
	resp["users_count"] = len(users)
	resp["posts_count"] = len(posts)
	c.JSON(http.StatusOK, resp)
}

// ---- Enhanced User Model ----
type User struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Avatar       string    `json:"avatar"`
	CreatedAt    time.Time `json:"createdAt"`
	LastLogin    time.Time `json:"lastLogin"`
	IsActive     bool      `json:"isActive"`
}
var users = map[string]*User{
	"ram": {
		ID: "ram", Name: "Ram", Email: "ram@pedal.com",
		PasswordHash: "$2a$10$dummy.hash.for.demo.purposes.only",
		Avatar: "https://i.pravatar.cc/100?img=12",
		CreatedAt: time.Now().Add(-30*24*time.Hour),
		LastLogin: time.Now().Add(-1*time.Hour),
		IsActive: true,
	},
	"hanuma": {
		ID: "hanuma", Name: "Hanuma", Email: "hanuma@pedal.com",
		PasswordHash: "$2a$10$dummy.hash.for.demo.purposes.only",
		Avatar: "https://i.pravatar.cc/100?img=13",
		CreatedAt: time.Now().Add(-20*24*time.Hour),
		LastLogin: time.Now().Add(-2*time.Hour),
		IsActive: true,
	},
	"dummy": {
		ID: "dummy", Name: "Demo User", Email: "demo@pedal.com",
		PasswordHash: "$2a$10$dummy.hash.for.demo.purposes.only",
		Avatar: "https://i.pravatar.cc/100?img=14",
		CreatedAt: time.Now().Add(-10*24*time.Hour),
		LastLogin: time.Now().Add(-30*time.Minute),
		IsActive: true,
	},
}
var usersMutex sync.RWMutex

// ---- Dynamic User Management Functions ----
func generateID(prefix string) string {
	bytes := make([]byte, 8)
	rand.Read(bytes)
	return fmt.Sprintf("%s_%s", prefix, hex.EncodeToString(bytes))
}

func findUserByEmail(email string) (*User, bool) {
	usersMutex.RLock()
	defer usersMutex.RUnlock()
	for _, user := range users {
		if user.Email == email {
			return user, true
		}
	}
	return nil, false
}

func findUserByID(id string) (*User, bool) {
	usersMutex.RLock()
	defer usersMutex.RUnlock()
	user, exists := users[id]
	return user, exists
}

func createUser(user *User) {
	usersMutex.Lock()
	defer usersMutex.Unlock()
	users[user.ID] = user
}

func updateUser(user *User) {
	usersMutex.Lock()
	defer usersMutex.Unlock()
	users[user.ID] = user
}

// ---- JWT Token Management ----
func (a *App) generateJWT(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(a.JWTSecret))
}

// ---- Additional Auth Handlers ----
func (a *App) logoutHandler(c *gin.Context) {
	// In a real implementation, you might blacklist the token
	c.JSON(http.StatusOK, gin.H{"message": "logged out successfully"})
}

func (a *App) profileHandler(c *gin.Context) {
	userID := c.GetString("userID")
	user, exists := findUserByID(userID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// ---- Dynamic User Handlers ----
func (a *App) searchUsers(c *gin.Context) {
	query := c.Query("q")
	limit := 10
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	usersMutex.RLock()
	defer usersMutex.RUnlock()

	var results []*User
	for _, user := range users {
		if !user.IsActive {
			continue
		}
		if query == "" || strings.Contains(strings.ToLower(user.Name), strings.ToLower(query)) || 
			strings.Contains(strings.ToLower(user.Email), strings.ToLower(query)) {
			results = append(results, user)
			if len(results) >= limit {
				break
			}
		}
	}
	c.JSON(http.StatusOK, gin.H{"users": results, "count": len(results)})
}

func (a *App) updateProfile(c *gin.Context) {
	userID := c.GetString("userID")
	user, exists := findUserByID(userID)
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	var req struct {
		Name   string `json:"name"`
		Avatar string `json:"avatar"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if req.Name != "" {
		user.Name = req.Name
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}

	updateUser(user)
	c.JSON(http.StatusOK, user)
}

func (a *App) getUserByID(c *gin.Context) {
	id := c.Param("id")
	user, exists := findUserByID(id)
	if !exists || !user.IsActive {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// ---- Dynamic Post Handlers ----
func (a *App) listPosts(c *gin.Context) {
	postsMutex.RLock()
	defer postsMutex.RUnlock()
	c.JSON(http.StatusOK, posts)
}

func (a *App) getPost(c *gin.Context) {
	id := c.Param("id")
	postsMutex.RLock()
	defer postsMutex.RUnlock()
	for _, post := range posts {
		if post.ID == id {
			c.JSON(http.StatusOK, post)
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
}

func (a *App) updatePost(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("userID")
	var req struct{ Text string `json:"text"` }
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	postsMutex.Lock()
	defer postsMutex.Unlock()
	for i := range posts {
		if posts[i].ID == id && posts[i].AuthorID == userID {
			posts[i].Text = req.Text
			c.JSON(http.StatusOK, posts[i])
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "post not found or unauthorized"})
}

func (a *App) deletePost(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetString("userID")

	postsMutex.Lock()
	defer postsMutex.Unlock()
	for i, post := range posts {
		if post.ID == id && post.AuthorID == userID {
			posts = append(posts[:i], posts[i+1:]...)
			c.JSON(http.StatusOK, gin.H{"message": "post deleted"})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "post not found or unauthorized"})
}

func (a *App) getPostReactions(c *gin.Context) {
	id := c.Param("id")
	postsMutex.RLock()
	defer postsMutex.RUnlock()
	for _, post := range posts {
		if post.ID == id {
			c.JSON(http.StatusOK, gin.H{"reactions": post.Reactions})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
}

func (a *App) addComment(c *gin.Context) {
	postID := c.Param("id")
	userID := c.GetString("userID")
	var req struct{ Text string `json:"text"` }
	if err := c.ShouldBindJSON(&req); err != nil || strings.TrimSpace(req.Text) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Check if post exists
	postsMutex.RLock()
	postExists := false
	for _, post := range posts {
		if post.ID == postID {
			postExists = true
			break
		}
	}
	postsMutex.RUnlock()

	if !postExists {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}

	comment := Comment{
		ID: generateID("comment"),
		PostID: postID,
		AuthorID: userID,
		Text: req.Text,
		CreatedAt: time.Now(),
	}

	commentsMutex.Lock()
	comments = append(comments, comment)
	commentsMutex.Unlock()

	c.JSON(http.StatusCreated, comment)
}

func (a *App) getComments(c *gin.Context) {
	postID := c.Param("id")
	commentsMutex.RLock()
	defer commentsMutex.RUnlock()

	var postComments []Comment
	for _, comment := range comments {
		if comment.PostID == postID {
			postComments = append(postComments, comment)
		}
	}
	c.JSON(http.StatusOK, postComments)
}

// ---- Live Stats Handler ----
func (a *App) liveStatsHandler(c *gin.Context) {
	usersMutex.RLock()
	postsMutex.RLock()
	commentsMutex.RLock()
	a.ClientsMu.RLock()

	stats := gin.H{
		"timestamp": time.Now(),
		"users": gin.H{
			"total": len(users),
			"active": func() int {
				count := 0
				for _, u := range users {
					if u.IsActive { count++ }
				}
				return count
			}(),
			"online": len(a.Clients),
		},
		"posts": gin.H{
			"total": len(posts),
			"today": func() int {
				count := 0
				today := time.Now().Truncate(24 * time.Hour)
				for _, p := range posts {
					if p.CreatedAt.After(today) { count++ }
				}
				return count
			}(),
		},
		"comments": gin.H{
			"total": len(comments),
		},
		"messages": gin.H{
			"total": len(messages),
		},
	}

	a.ClientsMu.RUnlock()
	commentsMutex.RUnlock()
	postsMutex.RUnlock()
	usersMutex.RUnlock()

	c.JSON(http.StatusOK, stats)
}

// ---- Configuration Management ----
type AppConfig struct {
	AppName        string `json:"appName"`
	Version        string `json:"version"`
	MaxUsers       int    `json:"maxUsers"`
	RateLimit      int    `json:"rateLimit"`
	MaintenanceMode bool   `json:"maintenanceMode"`
	Features       map[string]bool `json:"features"`
}

var appConfig = AppConfig{
	AppName:        "PEDAL Backend",
	Version:        "2.0.0",
	MaxUsers:       10000,
	RateLimit:      20,
	MaintenanceMode: false,
	Features: map[string]bool{
		"websocket":     true,
		"realtime":      true,
		"comments":      true,
		"reactions":     true,
		"fileUpload":    false,
		"notifications": true,
	},
}
var configMutex sync.RWMutex

func (a *App) getConfigHandler(c *gin.Context) {
	configMutex.RLock()
	defer configMutex.RUnlock()
	c.JSON(http.StatusOK, appConfig)
}

func (a *App) updateConfigHandler(c *gin.Context) {
	var req AppConfig
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	configMutex.Lock()
	defer configMutex.Unlock()
	
	// Update configuration
	if req.AppName != "" {
		appConfig.AppName = req.AppName
	}
	if req.Version != "" {
		appConfig.Version = req.Version
	}
	if req.MaxUsers > 0 {
		appConfig.MaxUsers = req.MaxUsers
	}
	if req.RateLimit > 0 {
		appConfig.RateLimit = req.RateLimit
	}
	appConfig.MaintenanceMode = req.MaintenanceMode
	if req.Features != nil {
		for key, value := range req.Features {
			appConfig.Features[key] = value
		}
	}

	c.JSON(http.StatusOK, appConfig)
}
// follower -> set(following)
var follows = map[string]map[string]bool{
	"ram":    {"hanuma": true},
	"hanuma": {"ram": true},
	"dummy":  {"ram": true, "hanuma": true},
}

type Post struct {
	ID        string            `json:"id"`
	AuthorID  string            `json:"authorId"`
	Text      string            `json:"text"`
	CreatedAt time.Time         `json:"createdAt"`
	Reactions map[string]string `json:"reactions"` // userId -> type (like)
}

var posts = []Post{
	{ID: "p-1", AuthorID: "ram", Text: "First ride of the season!", CreatedAt: time.Now().Add(-2 * time.Hour), Reactions: map[string]string{"hanuma": "like"}},
	{ID: "p-2", AuthorID: "hanuma", Text: "Trail condition looks perfect today.", CreatedAt: time.Now().Add(-90 * time.Minute), Reactions: map[string]string{"ram": "like"}},
}
var postsMutex sync.RWMutex

// Comment model
type Comment struct {
	ID       string    `json:"id"`
	PostID   string    `json:"postId"`
	AuthorID string    `json:"authorId"`
	Text     string    `json:"text"`
	CreatedAt time.Time `json:"createdAt"`
}
var comments = []Comment{}
var commentsMutex sync.RWMutex

func (a *App) listUsers(c *gin.Context) {
	usersMutex.RLock()
	defer usersMutex.RUnlock()
	out := make([]*User, 0, len(users))
	for _, u := range users { 
		if u.IsActive {
			out = append(out, u) 
		}
	}
	c.JSON(http.StatusOK, out)
}

func (a *App) followUser(c *gin.Context) {
	userID := c.GetString("userID")
	target := c.Param("id")
	if _, ok := users[target]; !ok { c.JSON(http.StatusNotFound, gin.H{"error":"user not found"}); return }
	if follows[userID] == nil { follows[userID] = map[string]bool{} }
	follows[userID][target] = true
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (a *App) unfollowUser(c *gin.Context) {
	userID := c.GetString("userID")
	target := c.Param("id")
	if follows[userID] != nil { delete(follows[userID], target) }
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (a *App) createPost(c *gin.Context) {
	userID := c.GetString("userID")
	var req struct{ Text string `json:"text"` }
	if err := c.BindJSON(&req); err != nil || strings.TrimSpace(req.Text) == "" { c.JSON(http.StatusBadRequest, gin.H{"error":"invalid payload"}); return }
	p := Post{ID: fmt.Sprintf("p-%d", time.Now().UnixNano()), AuthorID: userID, Text: req.Text, CreatedAt: time.Now(), Reactions: map[string]string{}}
	posts = append([]Post{p}, posts...) // prepend
	c.JSON(http.StatusCreated, p)
}

func (a *App) reactPost(c *gin.Context) {
	userID := c.GetString("userID")
	id := c.Param("id")
	var req struct{ Type string `json:"type"` }
	_ = c.BindJSON(&req)
	if req.Type == "" { req.Type = "like" }
	for i := range posts {
		if posts[i].ID == id {
			if posts[i].Reactions == nil { posts[i].Reactions = map[string]string{} }
			posts[i].Reactions[userID] = req.Type
			c.JSON(http.StatusOK, posts[i]); return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error":"post not found"})
}

func (a *App) feedHandler(c *gin.Context) {
	// simple feed: return recent posts by everyone followed + self
	userID := c.GetString("userID")
	followSet := follows[userID]
	out := make([]Post, 0, len(posts))
	for _, p := range posts {
		if p.AuthorID == userID || (followSet != nil && followSet[p.AuthorID]) { out = append(out, p) }
	}
	c.JSON(http.StatusOK, out)
}
