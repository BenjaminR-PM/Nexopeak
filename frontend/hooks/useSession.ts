import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SessionData {
  access_token: string | null
  refresh_token: string | null
  user: any | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const useSession = () => {
  const [sessionData, setSessionData] = useState<SessionData>({
    access_token: null,
    refresh_token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true
  })
  
  const router = useRouter()

  // Initialize session from localStorage
  useEffect(() => {
    const access_token = localStorage.getItem('access_token')
    const refresh_token = localStorage.getItem('refresh_token')
    
    if (access_token && refresh_token) {
      setSessionData(prev => ({
        ...prev,
        access_token,
        refresh_token,
        isAuthenticated: true,
        isLoading: false
      }))
      
      // Fetch user data
      fetchUserData(access_token)
    } else {
      setSessionData(prev => ({
        ...prev,
        isLoading: false
      }))
    }
  }, [])

  // Fetch user data
  const fetchUserData = useCallback(async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
      const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setSessionData(prev => ({
          ...prev,
          user: userData
        }))
      } else {
        // Token invalid, clear session
        logout()
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      logout()
    }
  }, [])

  // Refresh token
  const refreshToken = useCallback(async () => {
    const refresh_token = localStorage.getItem('refresh_token')
    if (!refresh_token) {
      logout()
      return false
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
      const response = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token
        })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        
        setSessionData(prev => ({
          ...prev,
          access_token: data.access_token,
          refresh_token: data.refresh_token
        }))
        
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }, [])

  // Extend session with activity
  const extendSession = useCallback(async () => {
    const access_token = localStorage.getItem('access_token')
    if (!access_token) {
      return false
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
      const response = await fetch(`${apiUrl}/api/v1/auth/extend-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('access_token', data.access_token)
        
        setSessionData(prev => ({
          ...prev,
          access_token: data.access_token
        }))
        
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Session extension failed:', error)
      return false
    }
  }, [])

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('remember_me')
    localStorage.removeItem('google_remember_me')
    
    setSessionData({
      access_token: null,
      refresh_token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false
    })
    
    router.push('/auth/login')
  }, [router])

  // Auto-refresh token logic
  useEffect(() => {
    if (!sessionData.refresh_token) return

    const refreshInterval = setInterval(async () => {
      const success = await refreshToken()
      if (!success) {
        clearInterval(refreshInterval)
      }
    }, 14 * 60 * 1000) // Refresh every 14 minutes

    return () => clearInterval(refreshInterval)
  }, [sessionData.refresh_token, refreshToken])

  // Session activity tracking
  useEffect(() => {
    if (!sessionData.isAuthenticated) return

    let activityTimeout: NodeJS.Timeout

    const handleActivity = () => {
      clearTimeout(activityTimeout)
      
      // Extend session after 30 minutes of inactivity
      activityTimeout = setTimeout(async () => {
        await extendSession()
      }, 30 * 60 * 1000)
    }

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Initial activity
    handleActivity()

    return () => {
      clearTimeout(activityTimeout)
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [sessionData.isAuthenticated, extendSession])

  // Check token validity on mount and route changes
  useEffect(() => {
    const checkTokenValidity = async () => {
      const access_token = localStorage.getItem('access_token')
      if (!access_token) return

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
        const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        })

        if (!response.ok) {
          // Try to refresh token
          const refreshSuccess = await refreshToken()
          if (!refreshSuccess) {
            logout()
          }
        }
      } catch (error) {
        console.error('Token validation failed:', error)
        logout()
      }
    }

    checkTokenValidity()
  }, [refreshToken, logout])

  return {
    ...sessionData,
    refreshToken,
    extendSession,
    logout,
    fetchUserData
  }
}
