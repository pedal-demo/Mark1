import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { messages } from '../services/api'
import { Tables } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface MessageContextType {
  conversations: any[]
  activeConversation: string | null
  messages: Tables<'messages'>[]
  loading: boolean
  sendMessage: (content: string, receiverId?: string, roomId?: string) => Promise<void>
  setActiveConversation: (conversationId: string | null) => void
  refreshMessages: () => Promise<void>
}

const MessageContext = createContext<MessageContextType | undefined>(undefined)

export const useMessages = () => {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider')
  }
  return context
}

interface MessageProviderProps {
  children: ReactNode
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messageList, setMessageList] = useState<Tables<'messages'>[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const refreshMessages = async () => {
    if (!user || !activeConversation) return

    setLoading(true)
    try {
      const result = await messages.getMessages(activeConversation)
      if (result.success && result.data) {
        setMessageList(result.data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (content: string, receiverId?: string, roomId?: string) => {
    if (!user) return

    try {
      const conversationId = roomId || receiverId || 'default-conversation'
      
      const result = await messages.sendMessage(conversationId, content)
      if (result.success && result.data) {
        setMessageList(prev => [...prev, result.data!])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  useEffect(() => {
    if (user && activeConversation) {
      refreshMessages()
      
      // Subscribe to real-time messages
      const subscription = messages.subscribeToMessages(activeConversation, (newMessage) => {
        setMessageList(prev => [...prev, newMessage])
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user, activeConversation])

  const value: MessageContextType = {
    conversations,
    activeConversation,
    messages: messageList,
    loading,
    sendMessage,
    setActiveConversation,
    refreshMessages
  }

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  )
}
