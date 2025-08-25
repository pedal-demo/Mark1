import { useState, useEffect, useCallback } from 'react'
import { ApiResponse } from '../services/api'

interface UseApiOptions {
  immediate?: boolean
  cache?: boolean
  cacheKey?: string
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const { immediate = true, cache = false, cacheKey } = options
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall()
      
      if (result.success) {
        setData(result.data)
        
        // Cache successful results if enabled
        if (cache && cacheKey && result.data) {
          localStorage.setItem(`api_cache_${cacheKey}`, JSON.stringify({
            data: result.data,
            timestamp: Date.now()
          }))
        }
      } else {
        setError(result.error || 'An error occurred')
        
        // Try to load from cache if API fails
        if (cache && cacheKey) {
          const cached = localStorage.getItem(`api_cache_${cacheKey}`)
          if (cached) {
            const { data: cachedData } = JSON.parse(cached)
            setData(cachedData)
            setError('Using cached data (offline)')
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error')
      
      // Try to load from cache on network error
      if (cache && cacheKey) {
        const cached = localStorage.getItem(`api_cache_${cacheKey}`)
        if (cached) {
          const { data: cachedData } = JSON.parse(cached)
          setData(cachedData)
          setError('Using cached data (offline)')
        }
      }
    } finally {
      setLoading(false)
    }
  }, [apiCall, cache, cacheKey])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { data, loading, error, execute, refetch: execute }
}

export function useMutation<T, P = any>(
  apiCall: (params: P) => Promise<ApiResponse<T>>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (params: P): Promise<{ success: boolean; data?: T; error?: string }> => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiCall(params)
      
      if (result.success) {
        return { success: true, data: result.data || undefined }
      } else {
        setError(result.error || 'An error occurred')
        return { success: false, error: result.error || 'An error occurred' }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Network error'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [apiCall])

  return { mutate, loading, error }
}
