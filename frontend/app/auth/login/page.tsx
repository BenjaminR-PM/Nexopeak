'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Zap,
  ArrowRight
} from 'lucide-react'
import { RequireNoAuth } from '@/components/ProtectedRoute'
import Script from 'next/script'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      // Verify token is still valid
      verifyTokenAndRedirect(token)
    }
  }, [])

  // Initialize Google Sign-In
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '641526035282-75q9tavd87q4spnhfemarscj2679t78m.apps.googleusercontent.com',
        callback: handleGoogleResponse
      })
    }
  }, [])

  const verifyTokenAndRedirect = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
      const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Token is valid, redirect to dashboard
        router.push('/dashboard')
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    } catch (error) {
      // Remove invalid tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          remember_me: rememberMe
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Store tokens
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        
        if (data.remember_me) {
          localStorage.setItem('remember_me', 'true')
        }

        setSuccess('Login successful! Redirecting...')
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        setError(data.detail || 'Login failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleResponse = async (response: any) => {
    console.log('Google response received:', response)
    setIsOAuthLoading(true)
    setError('')
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
      console.log('API URL:', apiUrl)
      
      const apiResponse = await fetch(`${apiUrl}/api/v1/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: response.credential,
          remember_me: rememberMe
        }),
      })

      console.log('Response status:', apiResponse.status)

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.detail || 'Google login failed')
      }

      const loginData = await apiResponse.json()
      console.log('Login successful:', loginData.user.email)
      
      // Store authentication data
      localStorage.setItem('access_token', loginData.access_token)
      localStorage.setItem('refresh_token', loginData.refresh_token)
      localStorage.setItem('user_data', JSON.stringify(loginData.user))
      
      if (loginData.remember_me) {
        localStorage.setItem('remember_me', 'true')
      }
      
      setSuccess(`Welcome back ${loginData.user.name}! Redirecting...`)
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
      
    } catch (error: any) {
      console.error('Google login error:', error)
      setError(error.message || 'Google login failed. Please try again.')
    } finally {
      setIsOAuthLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    console.log('Google login clicked!')
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.prompt()
    } else {
      setError('Google Sign-In not loaded. Please refresh the page.')
    }
  }

  // Auto-refresh token logic
  useEffect(() => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      const refreshInterval = setInterval(async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
          const response = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              refresh_token: refreshToken
            })
          })

          if (response.ok) {
            const data = await response.json()
            localStorage.setItem('access_token', data.access_token)
            localStorage.setItem('refresh_token', data.refresh_token)
          } else {
            // Refresh failed, clear tokens
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            clearInterval(refreshInterval)
          }
        } catch (error) {
          // Network error, clear tokens
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          clearInterval(refreshInterval)
        }
      }, 14 * 60 * 1000) // Refresh every 14 minutes (before 15-minute expiry)

      return () => clearInterval(refreshInterval)
    }
  }, [])

  return (
    <>
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="beforeInteractive"
      />
      <RequireNoAuth>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-orange-600 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back
              </h2>
              <p className="text-gray-600">
                Sign in to continue optimizing your marketing performance
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isOAuthLoading}
                className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-colors duration-200"
              >
                {isOAuthLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>
              </div>

              <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="h-5 w-5" />
                    <span>{success}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pl-10 pr-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me for 90 days
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="font-medium text-orange-600 hover:text-orange-500">
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-lg py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Sign in to dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </div>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/auth/signup" className="font-medium text-orange-600 hover:text-orange-500">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{' '}
                <Link href="/terms-of-service" className="text-orange-600 hover:text-orange-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" className="text-orange-600 hover:text-orange-500">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </RequireNoAuth>
    </>
  )
}

// Add TypeScript declarations for Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: () => void
        }
      }
    }
  }
}
