// DataService.ts - Centralized data management for PEDAL app
import followService from './followService';
export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  bio?: string;
  location?: string;
  joinDate: string;
  followers: number;
  following: number;
  posts: number;
  likes: number;
  isOnline: boolean;
  lastSeen: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  images?: string[];
  location?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  shares: number;
  upvotes: number;
  downvotes: number;
  tags: string[];
  isLiked: boolean;
  isBookmarked: boolean;
  isUpvoted: boolean;
  isDownvoted: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  upvotes: number;
  downvotes: number;
  replies: Comment[];
  isLiked: boolean;
  isUpvoted: boolean;
  isDownvoted: boolean;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share';
  fromUserId: string;
  fromUser: {
    name: string;
    username: string;
    avatar: string;
  };
  toUserId: string;
  postId?: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  timestamp: string;
}

export interface LiveStats {
  activeUsers: number;
  todayRides: number;
  newPosts: number;
  onlineNow: number;
  totalUsers: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  category: 'auth' | 'post' | 'user' | 'system' | 'api';
  message: string;
  userId?: string;
  details?: any;
}

class DataService {
  private static instance: DataService;
  private posts: Post[] = [];
  private users: User[] = [];
  private notifications: Notification[] = [];
  private messages: Message[] = [];
  private conversations: Conversation[] = [];
  private logs: SystemLog[] = [];
  private liveStats: LiveStats = {
    activeUsers: 0,
    todayRides: 0,
    newPosts: 0,
    onlineNow: 0,
    totalUsers: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0
  };

  private constructor() {
    this.initializeData();
    this.startLiveStatsUpdater();
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private initializeData() {
    // Load data from localStorage or initialize with sample data
    this.loadFromStorage();
    if (this.posts.length === 0) {
      this.initializeSampleData();
    }
  }

  private loadFromStorage() {
    try {
      const storedPosts = localStorage.getItem('pedal_posts');
      const storedUsers = localStorage.getItem('pedal_users');
      const storedNotifications = localStorage.getItem('pedal_notifications');
      const storedMessages = localStorage.getItem('pedal_messages');
      const storedLogs = localStorage.getItem('pedal_logs');

      if (storedPosts) this.posts = JSON.parse(storedPosts);
      if (storedUsers) this.users = JSON.parse(storedUsers);
      if (storedNotifications) this.notifications = JSON.parse(storedNotifications);
      if (storedMessages) this.messages = JSON.parse(storedMessages);
      if (storedLogs) this.logs = JSON.parse(storedLogs);
    } catch (error) {
      console.error('Error loading data from storage:', error);
      this.log('error', 'system', 'Failed to load data from localStorage', undefined, error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('pedal_posts', JSON.stringify(this.posts));
      localStorage.setItem('pedal_users', JSON.stringify(this.users));
      localStorage.setItem('pedal_notifications', JSON.stringify(this.notifications));
      localStorage.setItem('pedal_messages', JSON.stringify(this.messages));
      localStorage.setItem('pedal_logs', JSON.stringify(this.logs.slice(-1000))); // Keep last 1000 logs
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }

  private initializeSampleData() {
    // Initialize sample users
    this.users = [
      {
        id: 'user-1',
        username: 'alexracing',
        fullName: 'Alex Rodriguez',
        email: 'alex@example.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        bio: 'Motorcycle enthusiast and adventure rider',
        location: 'California, USA',
        joinDate: '2023-01-15',
        followers: 1250,
        following: 890,
        posts: 156,
        likes: 2340,
        isOnline: true,
        lastSeen: new Date().toISOString()
      },
      {
        id: 'user-2',
        username: 'sarahrides',
        fullName: 'Sarah Chen',
        email: 'sarah@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        bio: 'Weekend warrior and track day enthusiast',
        location: 'New York, USA',
        joinDate: '2023-03-22',
        followers: 890,
        following: 654,
        posts: 89,
        likes: 1560,
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      }
    ];

    // Initialize sample posts
    this.posts = [
      {
        id: 'post-1',
        authorId: 'user-1',
        author: {
          id: 'user-1',
          name: 'Alex Rodriguez',
          username: 'alexracing',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        content: 'Just completed an epic 500km ride through the Himalayas! The views were absolutely breathtaking. 🏔️🏍️',
        images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=400&fit=crop'],
        location: 'Himalayas, India',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        likes: 124,
        comments: [],
        shares: 8,
        upvotes: 89,
        downvotes: 3,
        tags: ['#HimalayanRide', '#Adventure', '#MotorcycleLife'],
        isLiked: false,
        isBookmarked: false,
        isUpvoted: false,
        isDownvoted: false
      }
    ];

    this.updateLiveStats();
    this.saveToStorage();
  }

  private startLiveStatsUpdater() {
    setInterval(() => {
      this.updateLiveStats();
    }, 5000); // Update every 5 seconds
  }

  private updateLiveStats() {
    const now = Date.now();
    const onlineUsers = this.users.filter(user => 
      user.isOnline || (now - new Date(user.lastSeen).getTime()) < 5 * 60 * 1000
    );

    this.liveStats = {
      activeUsers: Math.floor(Math.random() * 500) + 2000,
      todayRides: Math.floor(Math.random() * 100) + 800,
      newPosts: Math.floor(Math.random() * 50) + 150,
      onlineNow: onlineUsers.length + Math.floor(Math.random() * 200) + 500,
      totalUsers: this.users.length + Math.floor(Math.random() * 1000) + 10000,
      totalPosts: this.posts.length + Math.floor(Math.random() * 500) + 5000,
      totalLikes: this.posts.reduce((sum, post) => sum + post.likes, 0) + Math.floor(Math.random() * 1000) + 25000,
      totalComments: this.posts.reduce((sum, post) => sum + post.comments.length, 0) + Math.floor(Math.random() * 200) + 3000
    };
  }

  public log(level: SystemLog['level'], category: SystemLog['category'], message: string, userId?: string, details?: any) {
    const logEntry: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      userId,
      details
    };

    this.logs.push(logEntry);
    console.log(`[${level.toUpperCase()}] ${category}: ${message}`, details);

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    this.saveToStorage();
  }

  // Post operations
  public createPost(postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'shares' | 'upvotes' | 'downvotes' | 'isLiked' | 'isBookmarked' | 'isUpvoted' | 'isDownvoted'>): Post {
    const newPost: Post = {
      ...postData,
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      shares: 0,
      upvotes: 0,
      downvotes: 0,
      isLiked: false,
      isBookmarked: false,
      isUpvoted: false,
      isDownvoted: false
    };

    this.posts.unshift(newPost);
    this.log('info', 'post', `New post created by ${postData.author.username}`, postData.authorId);
    this.saveToStorage();
    return newPost;
  }

  public getPosts(): Post[] {
    return [...this.posts];
  }

  public getPost(id: string): Post | undefined {
    return this.posts.find(post => post.id === id);
  }

  public likePost(postId: string, userId: string): boolean {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return false;

    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
    
    this.log('info', 'post', `Post ${post.isLiked ? 'liked' : 'unliked'} by user`, userId);
    this.saveToStorage();
    return post.isLiked;
  }

  public upvotePost(postId: string, userId: string): boolean {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return false;

    if (post.isDownvoted) {
      post.downvotes--;
      post.isDownvoted = false;
    }

    post.isUpvoted = !post.isUpvoted;
    post.upvotes += post.isUpvoted ? 1 : -1;
    
    this.log('info', 'post', `Post ${post.isUpvoted ? 'upvoted' : 'un-upvoted'} by user`, userId);
    this.saveToStorage();
    return post.isUpvoted;
  }

  public downvotePost(postId: string, userId: string): boolean {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return false;

    if (post.isUpvoted) {
      post.upvotes--;
      post.isUpvoted = false;
    }

    post.isDownvoted = !post.isDownvoted;
    post.downvotes += post.isDownvoted ? 1 : -1;
    
    this.log('info', 'post', `Post ${post.isDownvoted ? 'downvoted' : 'un-downvoted'} by user`, userId);
    this.saveToStorage();
    return post.isDownvoted;
  }

  public bookmarkPost(postId: string, userId: string): boolean {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return false;

    post.isBookmarked = !post.isBookmarked;
    
    this.log('info', 'post', `Post ${post.isBookmarked ? 'bookmarked' : 'unbookmarked'} by user`, userId);
    this.saveToStorage();
    return post.isBookmarked;
  }

  public sharePost(postId: string, userId: string): boolean {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return false;

    post.shares++;
    
    this.log('info', 'post', `Post shared by user`, userId);
    this.saveToStorage();
    return true;
  }

  // Comment operations
  public addComment(postId: string, commentData: Omit<Comment, 'id' | 'timestamp' | 'likes' | 'upvotes' | 'downvotes' | 'replies' | 'isLiked' | 'isUpvoted' | 'isDownvoted'>): Comment | null {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return null;

    const newComment: Comment = {
      ...commentData,
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      likes: 0,
      upvotes: 0,
      downvotes: 0,
      replies: [],
      isLiked: false,
      isUpvoted: false,
      isDownvoted: false
    };

    post.comments.push(newComment);
    this.log('info', 'post', `Comment added to post by ${commentData.author.username}`, commentData.authorId);
    this.saveToStorage();
    return newComment;
  }

  public addReply(postId: string, commentId: string, replyData: any): Comment | null {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return null;

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) return null;

    const newReply: Comment = {
      id: replyData.id,
      postId: postId,
      authorId: replyData.author.username,
      author: replyData.author,
      content: replyData.content,
      timestamp: replyData.timestamp,
      likes: 0,
      upvotes: 0,
      downvotes: 0,
      replies: [],
      isLiked: false,
      isUpvoted: false,
      isDownvoted: false
    };

    comment.replies.push(newReply);
    this.log('info', 'post', `Reply added to comment by ${replyData.author.username}`);
    this.saveToStorage();
    return newReply;
  }

  public upvoteComment(postId: string, commentId: string, userId: string): boolean {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return false;

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) return false;

    if (comment.isDownvoted) {
      comment.isDownvoted = false;
      comment.downvotes = Math.max(0, comment.downvotes - 1);
    }

    comment.isUpvoted = !comment.isUpvoted;
    comment.upvotes += comment.isUpvoted ? 1 : -1;
    comment.upvotes = Math.max(0, comment.upvotes);
    
    this.log('info', 'post', `Comment ${comment.isUpvoted ? 'upvoted' : 'un-upvoted'} by user`, userId);
    this.saveToStorage();
    return comment.isUpvoted;
  }

  public downvoteComment(postId: string, commentId: string, userId: string): boolean {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return false;

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) return false;

    if (comment.isUpvoted) {
      comment.isUpvoted = false;
      comment.upvotes = Math.max(0, comment.upvotes - 1);
    }

    comment.isDownvoted = !comment.isDownvoted;
    comment.downvotes += comment.isDownvoted ? 1 : -1;
    comment.downvotes = Math.max(0, comment.downvotes);
    
    this.log('info', 'post', `Comment ${comment.isDownvoted ? 'downvoted' : 'un-downvoted'} by user`, userId);
    this.saveToStorage();
    return comment.isDownvoted;
  }

  public upvoteReply(postId: string, commentId: string, replyId: string, userId: string): boolean {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return false;

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) return false;

    const reply = comment.replies.find(r => r.id === replyId);
    if (!reply) return false;

    if (reply.isDownvoted) {
      reply.isDownvoted = false;
      reply.downvotes = Math.max(0, reply.downvotes - 1);
    }

    reply.isUpvoted = !reply.isUpvoted;
    reply.upvotes += reply.isUpvoted ? 1 : -1;
    reply.upvotes = Math.max(0, reply.upvotes);
    
    this.log('info', 'post', `Reply ${reply.isUpvoted ? 'upvoted' : 'un-upvoted'} by user`, userId);
    this.saveToStorage();
    return reply.isUpvoted;
  }

  public downvoteReply(postId: string, commentId: string, replyId: string, userId: string): boolean {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return false;

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) return false;

    const reply = comment.replies.find(r => r.id === replyId);
    if (!reply) return false;

    if (reply.isUpvoted) {
      reply.isUpvoted = false;
      reply.upvotes = Math.max(0, reply.upvotes - 1);
    }

    reply.isDownvoted = !reply.isDownvoted;
    reply.downvotes += reply.isDownvoted ? 1 : -1;
    reply.downvotes = Math.max(0, reply.downvotes);
    
    this.log('info', 'post', `Reply ${reply.isDownvoted ? 'downvoted' : 'un-downvoted'} by user`, userId);
    this.saveToStorage();
    return reply.isDownvoted;
  }

  // User operations
  public getUsers(): User[] {
    return [...this.users];
  }

  public getUser(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  public updateUserOnlineStatus(userId: string, isOnline: boolean) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeen = new Date().toISOString();
      this.saveToStorage();
    }
  }

  // Follow operations (updates counts and creates notification)
  public followUser(followerId: string, followingId: string): boolean {
    try {
      if (!followerId || !followingId || followerId === followingId) return false;
      if (followService.isFollowing(followerId, followingId)) return false;

      followService.follow(followerId, followingId);

      const follower = this.users.find(u => u.id === followerId);
      const following = this.users.find(u => u.id === followingId);
      if (follower) follower.following = Math.max(0, (follower.following || 0) + 1);
      if (following) following.followers = Math.max(0, (following.followers || 0) + 1);

      // Create notification for the followed user
      if (follower && following) {
        this.addNotification({
          type: 'follow',
          fromUserId: follower.id,
          fromUser: {
            name: follower.fullName || follower.username,
            username: follower.username,
            avatar: follower.avatar,
          },
          toUserId: following.id,
          message: `${follower.fullName || follower.username} started following you`,
        });
      }

      this.log('info', 'user', `User followed`, followerId, { followingId });
      this.saveToStorage();
      return true;
    } catch (e) {
      this.log('error', 'user', 'Failed to follow user', followerId, { followingId, error: e });
      return false;
    }
  }

  public unfollowUser(followerId: string, followingId: string): boolean {
    try {
      if (!followerId || !followingId) return false;
      if (!followService.isFollowing(followerId, followingId)) return false;

      followService.unfollow(followerId, followingId);

      const follower = this.users.find(u => u.id === followerId);
      const following = this.users.find(u => u.id === followingId);
      if (follower) follower.following = Math.max(0, (follower.following || 0) - 1);
      if (following) following.followers = Math.max(0, (following.followers || 0) - 1);

      this.log('info', 'user', `User unfollowed`, followerId, { followingId });
      this.saveToStorage();
      return true;
    } catch (e) {
      this.log('error', 'user', 'Failed to unfollow user', followerId, { followingId, error: e });
      return false;
    }
  }

  // Notification operations
  public getNotifications(userId: string): Notification[] {
    return this.notifications.filter(n => n.toUserId === userId);
  }

  public addNotification(n: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): Notification {
    const notif: Notification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    this.notifications.unshift(notif);
    this.saveToStorage();
    return notif;
  }

  public markNotificationAsRead(notificationId: string): boolean {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // Live stats
  public getLiveStats(): LiveStats {
    return { ...this.liveStats };
  }

  // System logs
  public getLogs(limit: number = 100): SystemLog[] {
    return this.logs.slice(-limit).reverse();
  }

  public clearLogs(): void {
    this.logs = [];
    this.saveToStorage();
    this.log('info', 'system', 'System logs cleared');
  }
}

export default DataService.getInstance();
