package main

import (
	"context"
	"embed"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"golang.org/x/time/rate"
)

//go:embed admin/*
var adminFS embed.FS

type App struct {
	DB    *pgxpool.Pool
	RDB   *redis.Client
	Limiters sync.Map // key: ip -> *rate.Limiter
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

	app := &App{DB: db, RDB: rdb}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(requestLogger())
	r.Use(app.rateLimitMiddleware(20, time.Minute)) // 20 req/min/IP

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

	// Auth (scaffold)
	auth := r.Group("/api/auth")
	auth.POST("/login", app.loginHandler)
	auth.POST("/refresh", app.refreshHandler)

	// Users (example)
	r.GET("/api/users/me", app.authRequired(), app.meHandler)
	r.GET("/api/users", app.listUsers)

	// Messages (example CRUD)
	msg := r.Group("/api/messages", app.authRequired())
	msg.GET("", app.listMessages)
	msg.POST("", app.createMessage)

	// Social: posts, reactions, follows
	r.GET("/api/feed", app.feedHandler)
	r.POST("/api/posts", app.authRequired(), app.createPost)
	r.POST("/api/posts/:id/react", app.authRequired(), app.reactPost)
	r.POST("/api/follow/:id", app.authRequired(), app.followUser)
	r.DELETE("/api/follow/:id", app.authRequired(), app.unfollowUser)

	// WebSocket
	r.GET("/ws", app.wsHandler)

	// Admin Dashboard (static)
	r.GET("/admin", app.adminIndex)
	r.GET("/admin/stats", app.adminStats)

	log.Printf("server listening on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

func getenv(k, def string) string { if v := os.Getenv(k); v != "" { return v }; return def }

func requestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		lat := time.Since(start)
		log.Printf("%s %s %d %s", c.Request.Method, c.Request.URL.Path, c.Writer.Status(), lat)
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

func (a *App) loginHandler(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"token": "demo", "refresh": "demo"}) }
func (a *App) refreshHandler(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"token": "demo"}) }

func (a *App) authRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if !strings.HasPrefix(auth, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
			return
		}
		token := strings.TrimSpace(strings.TrimPrefix(auth, "Bearer "))
		// Map demo tokens to users
		userID := "dummy"
		switch strings.ToLower(token) {
		case "ram":
			userID = "ram"
		case "hanuma", "hanuman", "hanuma" /* duplicate guard */:
			userID = "hanuma"
		case "demo", "dummy", "me":
			userID = "dummy"
		}
		c.Set("userID", userID)
		c.Next()
	}
}

// Current user endpoint (demo)
func (a *App) meHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"id":   c.GetString("userID"),
		"name": "You",
		"avatar": "https://i.pravatar.cc/100?img=1",
	})
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

// WebSocket (basic echo)
func (a *App) wsHandler(c *gin.Context) {
	c.String(http.StatusOK, "WebSocket placeholder. Use a real upgrader in production.")
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

// ---- Social domain (in-memory) ----
type User struct { ID, Name, Avatar string }
var users = map[string]User{
	"ram":    {ID: "ram", Name: "Ram", Avatar: "https://i.pravatar.cc/100?img=12"},
	"hanuma": {ID: "hanuma", Name: "Hanuma", Avatar: "https://i.pravatar.cc/100?img=13"},
	"dummy":  {ID: "dummy", Name: "Dummy", Avatar: "https://i.pravatar.cc/100?img=14"},
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

func (a *App) listUsers(c *gin.Context) {
	out := make([]User, 0, len(users))
	for _, u := range users { out = append(out, u) }
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
