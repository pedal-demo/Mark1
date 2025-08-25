import { supabase, Tables, Inserts, Updates } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

// Types
export interface ApiResponse<T = any> {
  data: T | null
  error: string | null
  success: boolean
}

export interface CacheConfig {
  key: string
  ttl: number // Time to live in milliseconds
}

// Cache utility for offline functionality
class CacheManager {
  private static instance: CacheManager
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    
    // Also store in localStorage for persistence
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl
      }))
    } catch (error) {
      console.warn('Failed to store in localStorage:', error)
    }
  }

  get(key: string): any | null {
    // Try memory cache first
    const memoryItem = this.cache.get(key)
    if (memoryItem && Date.now() - memoryItem.timestamp < memoryItem.ttl) {
      return memoryItem.data
    }

    // Try localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`)
      if (stored) {
        const item = JSON.parse(stored)
        if (Date.now() - item.timestamp < item.ttl) {
          // Restore to memory cache
          this.cache.set(key, item)
          return item.data
        }
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error)
    }

    return null
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
      localStorage.removeItem(`cache_${key}`)
    } else {
      this.cache.clear()
      // Clear all cache items from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }
}

const cache = CacheManager.getInstance()

// Authentication Service
export class AuthService {
  static async signUp(email: string, password: string, userData: { username: string; full_name: string }): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      return { data: data.user, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async signIn(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data: data.user, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async signOut(): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear all cache on logout
      cache.clear()

      return { data: null, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}

// Posts Service
export class PostsService {
  static async createPost(postData: Inserts<'posts'>): Promise<ApiResponse<Tables<'posts'>>> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single()

      if (error) throw error

      // Clear posts cache to force refresh
      cache.clear('posts_feed')
      cache.clear('posts_user')

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async getFeed(limit: number = 20, offset: number = 0): Promise<ApiResponse<Tables<'posts'>[]>> {
    const cacheKey = `posts_feed_${limit}_${offset}`
    
    // Try cache first
    const cached = cache.get(cacheKey)
    if (cached) {
      return { data: cached, error: null, success: true }
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      // Cache the result
      cache.set(cacheKey, data, 2 * 60 * 1000) // 2 minutes cache

      return { data, error: null, success: true }
    } catch (error: any) {
      // Return cached data if available, even if expired
      const fallback = cache.get(cacheKey)
      if (fallback) {
        return { data: fallback, error: 'Using cached data (offline)', success: true }
      }
      
      return { data: null, error: error.message, success: false }
    }
  }

  static async likePost(postId: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.rpc('increment_post_likes', { post_id: postId })
      if (error) throw error

      // Clear relevant caches
      cache.clear('posts_feed')

      return { data: null, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async uploadMedia(file: File): Promise<ApiResponse<string>> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `posts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath)

      return { data: data.publicUrl, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }
}

// Events Service
export class EventsService {
  static async createEvent(eventData: Inserts<'events'>): Promise<ApiResponse<Tables<'events'>>> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single()

      if (error) throw error

      cache.clear('events_list')

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async getEvents(): Promise<ApiResponse<Tables<'events'>[]>> {
    const cacheKey = 'events_list'
    const cached = cache.get(cacheKey)
    
    if (cached) {
      return { data: cached, error: null, success: true }
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profiles:organizer_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('date', { ascending: true })

      if (error) throw error

      cache.set(cacheKey, data, 5 * 60 * 1000) // 5 minutes cache

      return { data, error: null, success: true }
    } catch (error: any) {
      const fallback = cache.get(cacheKey)
      if (fallback) {
        return { data: fallback, error: 'Using cached data (offline)', success: true }
      }
      
      return { data: null, error: error.message, success: false }
    }
  }

  static async joinEvent(eventId: string, verificationAnswers?: any): Promise<ApiResponse<null>> {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      // Insert into event_attendees table
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: user.id,
          verification_answers: verificationAnswers,
          status: verificationAnswers ? 'pending' : 'approved'
        })

      if (error) throw error

      cache.clear('events_list')

      return { data: null, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }
}

// Messages Service - Enhanced with real-time capabilities
export class MessagesService {
  static async getConversations(): Promise<ApiResponse<any[]>> {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            user_id,
            profiles(id, email, user_metadata)
          ),
          last_message:messages(content, created_at)
        `)
        .or(`created_by.eq.${user.id},participants.user_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async getMessages(conversationId: string): Promise<ApiResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(id, email, user_metadata)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async sendMessage(conversationId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text'): Promise<ApiResponse<any>> {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType
        })
        .select()
        .single()

      if (error) throw error

      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async createConversation(participantIds: string[], title?: string): Promise<ApiResponse<any>> {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title: title || 'New Conversation',
          created_by: user.id,
          type: participantIds.length > 1 ? 'group' : 'direct'
        })
        .select()
        .single()

      if (convError) throw convError

      // Add participants
      const participants = participantIds.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId
      }))

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants)

      if (participantsError) throw participantsError

      return { data: conversation, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static subscribeToMessages(conversationId: string, callback: (message: any) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        callback
      )
      .subscribe()
  }

  static subscribeToConversations(userId: string, callback: (conversation: any) => void) {
    return supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        callback
      )
      .subscribe()
  }

}

// Notifications Service
export class NotificationsService {
  static async getNotifications(): Promise<ApiResponse<Tables<'notifications'>[]>> {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async markAsRead(notificationId: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error

      return { data: null, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async createNotification(notificationData: Inserts<'notifications'>): Promise<ApiResponse<Tables<'notifications'>>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select()
        .single()

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }
}


// Profile Service
export class ProfileService {
  static async getProfile(userId?: string): Promise<ApiResponse<Tables<'profiles'>>> {
    try {
      const targetUserId = userId || (await AuthService.getCurrentUser())?.id
      if (!targetUserId) throw new Error('User not found')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async updateProfile(updates: Updates<'profiles'>): Promise<ApiResponse<Tables<'profiles'>>> {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }
}

// Network status utility
export class NetworkService {
  static isOnline(): boolean {
    return navigator.onLine
  }

  static onNetworkChange(callback: (isOnline: boolean) => void) {
    const handleOnline = () => callback(true)
    const handleOffline = () => callback(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }
}

// Export all services for easy access
export const api = {
  auth: AuthService,
  posts: PostsService,
  events: EventsService,
  messages: MessagesService,
  notifications: NotificationsService,
  profile: ProfileService,
  network: NetworkService
}

// Storage Service for file uploads
export class StorageService {
  static async uploadFile(file: File, bucket: string = 'uploads', folder?: string): Promise<ApiResponse<{ url: string; path: string }>> {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      return { 
        data: { url: publicUrl, path: data.path }, 
        error: null, 
        success: true 
      }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async uploadProfileImage(file: File): Promise<ApiResponse<{ url: string; path: string }>> {
    return this.uploadFile(file, 'profiles', 'avatars')
  }

  static async uploadPostMedia(file: File): Promise<ApiResponse<{ url: string; path: string }>> {
    return this.uploadFile(file, 'posts', 'media')
  }

  static async uploadMessageFile(file: File): Promise<ApiResponse<{ url: string; path: string }>> {
    return this.uploadFile(file, 'messages', 'attachments')
  }

  static async deleteFile(path: string, bucket: string = 'uploads'): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (error) throw error

      return { data: null, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static getPublicUrl(path: string, bucket: string = 'uploads'): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  static validateFile(file: File, maxSize: number = 5 * 1024 * 1024, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']): { valid: boolean; error?: string } {
    if (file.size > maxSize) {
      return { valid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` }
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `File type ${file.type} is not allowed` }
    }

    return { valid: true }
  }
}

// Maps Service for route storage and GPS tracking
export class MapsService {
  static async saveRoute(routeData: {
    name: string;
    description?: string;
    waypoints: { lat: number; lng: number; elevation?: number; timestamp?: string }[];
    distance: number;
    duration: number;
    difficulty: 'easy' | 'moderate' | 'hard';
    tags: string[];
  }): Promise<ApiResponse<any>> {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('routes')
        .insert({
          user_id: user.id,
          name: routeData.name,
          description: routeData.description,
          waypoints: routeData.waypoints,
          distance: routeData.distance,
          duration: routeData.duration,
          difficulty: routeData.difficulty,
          tags: routeData.tags,
          is_public: false
        })
        .select()
        .single()

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async getRoutes(filters?: {
    userId?: string;
    difficulty?: string;
    tags?: string[];
    isPublic?: boolean;
  }): Promise<ApiResponse<any[]>> {
    try {
      let query = supabase
        .from('routes')
        .select(`
          *,
          user:profiles(id, email, user_metadata)
        `)
        .order('created_at', { ascending: false })

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId)
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty)
      }

      if (filters?.isPublic !== undefined) {
        query = query.eq('is_public', filters.isPublic)
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      const { data, error } = await query

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async getRoute(routeId: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          user:profiles(id, email, user_metadata)
        `)
        .eq('id', routeId)
        .single()

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async updateRoute(routeId: string, updates: {
    name?: string;
    description?: string;
    is_public?: boolean;
    tags?: string[];
  }): Promise<ApiResponse<any>> {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('routes')
        .update(updates)
        .eq('id', routeId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async deleteRoute(routeId: string): Promise<ApiResponse<null>> {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId)
        .eq('user_id', user.id)

      if (error) throw error

      return { data: null, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async saveOfflineMap(mapData: {
    name: string;
    bounds: { north: number; south: number; east: number; west: number };
    zoom_level: number;
    tiles_data: string; // Base64 encoded tiles
    size_mb: number;
  }): Promise<ApiResponse<any>> {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('offline_maps')
        .insert({
          user_id: user.id,
          name: mapData.name,
          bounds: mapData.bounds,
          zoom_level: mapData.zoom_level,
          tiles_data: mapData.tiles_data,
          size_mb: mapData.size_mb
        })
        .select()
        .single()

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async getOfflineMaps(): Promise<ApiResponse<any[]>> {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('offline_maps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static async deleteOfflineMap(mapId: string): Promise<ApiResponse<null>> {
    try {
      const user = await AuthService.getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('offline_maps')
        .delete()
        .eq('id', mapId)
        .eq('user_id', user.id)

      if (error) throw error

      return { data: null, error: null, success: true }
    } catch (error: any) {
      return { data: null, error: error.message, success: false }
    }
  }

  static calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static calculateRouteDistance(waypoints: { lat: number; lng: number }[]): number {
    if (waypoints.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 1; i < waypoints.length; i++) {
      totalDistance += this.calculateDistance(waypoints[i - 1], waypoints[i]);
    }
    return totalDistance;
  }
}

// Export individual services
export const { auth, posts, events, messages, notifications, profile, network } = api
export const storage = StorageService
export const maps = MapsService
