'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowRight, Zap, AlertCircle } from 'lucide-react'
import Script from 'next/script'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organizationName: '',
    acceptTerms: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.organizationName) {
      alert('Please fill in all required fields')
      return
    }
    
    if (!formData.acceptTerms) {
      alert('Please accept the terms and conditions')
      return
    }
    
    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long')
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          password: formData.password,
          role: 'user'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Signup failed')
      }

      const userData = await response.json()
      alert('Account created successfully! You can now log in with your credentials.')
      
      // Redirect to login after success
      window.location.href = '/auth/login'
      
    } catch (error: any) {
      alert(error.message || 'Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize Google Sign-In
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '641526035282-75q9tavd87q4spnhfemarscj2679t78m.apps.googleusercontent.com',
        callback: handleGoogleResponse
      })
    }
  }, [])

  const handleGoogleResponse = async (response: any) => {
    console.log('Google response received:', response) // Debug log
    setIsOAuthLoading(true)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
      console.log('API URL:', apiUrl) // Debug log
      
      const apiResponse = await fetch(`${apiUrl}/api/v1/auth/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: response.credential
        }),
      })

      console.log('Response status:', apiResponse.status) // Debug log

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        console.error('API Error:', errorData) // Debug log
        throw new Error(errorData.detail || 'Google signup failed')
      }

      const loginData = await apiResponse.json()
      console.log('Login successful:', loginData.user.email) // Debug log
      
      // Store authentication data
      localStorage.setItem('access_token', loginData.access_token)
      localStorage.setItem('user_data', JSON.stringify(loginData.user))
      
      alert(`Welcome ${loginData.user.name}! Redirecting to dashboard...`)
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
      
    } catch (error: any) {
      console.error('Google signup error:', error) // Debug log
      alert(error.message || 'Google signup failed. Please try again.')
    } finally {
      setIsOAuthLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    console.log('Google signup clicked!') // Debug log
    if (typeof window !== 'undefined' && window.google) {
      window.google.accounts.id.prompt()
    } else {
      alert('Google Sign-In not loaded. Please refresh the page.')
    }
  }

  return (
    <>
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="beforeInteractive"
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-orange-600 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600">
            Start optimizing your marketing performance in under 10 minutes
          </p>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-orange-800 font-medium mb-1">Demo Mode Active</p>
              <p className="text-orange-700">
                Email verification is temporarily disabled. After signup, you'll be taken directly to the dashboard panel.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="John"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="john@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <div className="mt-1 relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="organizationName"
                  type="text"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Acme Corp"
                  required
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                                      className="w-full px-3 py-2 pl-10 pr-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                I agree to the{' '}
                <Link href="/terms" className="text-orange-600 hover:text-orange-500">
                  Terms and Conditions
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-lg py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Create account & enter dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-orange-600 hover:text-orange-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-orange-600 hover:text-orange-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
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
