import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { auth } from '../services/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, userData: { username: string; full_name: string }) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
      
      // Update localStorage for backward compatibility
      localStorage.setItem('isAuthenticated', user ? 'true' : 'false')
      if (user) {
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username || user.email?.split('@')[0],
          full_name: user.user_metadata?.full_name || ''
        }))
      } else {
        localStorage.removeItem('user')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await auth.signIn(email, password)
      if (result.success) {
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Sign in failed' }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: { username: string; full_name: string }) => {
    setLoading(true)
    try {
      const result = await auth.signUp(email, password, userData)
      if (result.success) {
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Sign up failed' }
      }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
