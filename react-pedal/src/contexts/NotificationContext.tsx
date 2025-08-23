import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { notifications } from '../services/api'
import { Tables } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface NotificationContextType {
  notifications: Tables<'notifications'>[]
  unreadCount: number
  loading: boolean
  markAsRead: (id: string) => Promise<void>
  refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notificationList, setNotificationList] = useState<Tables<'notifications'>[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const refreshNotifications = async () => {
    if (!user) return

    setLoading(true)
    try {
      const result = await notifications.getNotifications()
      if (result.success && result.data) {
        setNotificationList(result.data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const result = await notifications.markAsRead(id)
      if (result.success) {
        setNotificationList(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  useEffect(() => {
    if (user) {
      refreshNotifications()
    } else {
      setNotificationList([])
    }
  }, [user])

  const unreadCount = notificationList.filter(n => !n.read).length

  const value: NotificationContextType = {
    notifications: notificationList,
    unreadCount,
    loading,
    markAsRead,
    refreshNotifications
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
