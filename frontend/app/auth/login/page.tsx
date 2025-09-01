'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false)
  const [googleButtonError, setGoogleButtonError] = useState('')
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Initialize Google Sign-In after script loads
  useEffect(() => {
    if (googleScriptLoaded && googleButtonRef.current && window.google?.accounts?.id) {
      try {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '641526035282-75q9tavd87q4spnhfemarscj2679t78m.apps.googleusercontent.com',
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        // Render the button
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with'
        })

        setGoogleButtonError('')
      } catch (err) {
        console.error('Google button initialization error:', err)
        setGoogleButtonError('Failed to load Google Sign-In button')
      }
    }
  }, [googleScriptLoaded])

  const handleGoogleResponse = async (response: any) => {
    if (response.credential) {
      setIsOAuthLoading(true)
      setError('')

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
        const result = await fetch(`${apiUrl}/api/v1/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_token: response.credential,
            remember_me: rememberMe
          }),
        })

        if (result.ok) {
          const data = await result.json()

          // Store tokens
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('google_remember_me', rememberMe.toString())

          setSuccess('Google login successful! Redirecting...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 1000)
        } else {
          const errorData = await result.json()
          setError(errorData.detail || 'Google login failed')
        }
      } catch (err) {
        console.error('Google login error:', err)
        setError('Google login failed. Please try again.')
      } finally {
        setIsOAuthLoading(false)
      }
    }
  }

  const verifyTokenAndRedirect = async () => {
    const accessToken = localStorage.getItem('access_token')
    if (accessToken) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
        const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })

        if (response.ok) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.log('Token verification failed, staying on login page')
      }
    }
  }

  useEffect(() => {
    verifyTokenAndRedirect()
  }, [])

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
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          remember_me: rememberMe
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Store tokens
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        localStorage.setItem('user', JSON.stringify(data.user))

        setSuccess('Login successful! Redirecting...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RequireNoAuth>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your Nexopeak account</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pl-10 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-orange-600 hover:text-orange-700 transition-colors">
                  Forgot password?
                </Link>
              </div>

              {/* Error & Success Messages */}
              {error && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm text-green-700">{success}</span>
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <div className="space-y-4">
              {!googleScriptLoaded ? (
                <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <Loader2 className="w-5 h-5 text-gray-500 mr-2 animate-spin" />
                  <span className="text-sm text-gray-600">Loading Google Sign-In...</span>
                </div>
              ) : googleButtonError ? (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{googleButtonError}</span>
                </div>
              ) : (
                <div ref={googleButtonRef} className="w-full"></div>
              )}
              
              {isOAuthLoading && (
                <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <Loader2 className="w-5 h-5 text-gray-500 mr-2 animate-spin" />
                  <span className="text-sm text-gray-600">Signing in with Google...</span>
                </div>
              )}
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="font-medium text-orange-600 hover:text-orange-700 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Identity Services Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="beforeInteractive"
        onLoad={() => setGoogleScriptLoaded(true)}
        onError={() => {
          setGoogleScriptLoaded(true)
          setGoogleButtonError('Failed to load Google Sign-In')
        }}
      />
    </RequireNoAuth>
  )
}
