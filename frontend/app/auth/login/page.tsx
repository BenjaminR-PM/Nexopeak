'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Zap, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // For demo purposes, simulate login and redirect to dashboard
    setTimeout(() => {
      localStorage.setItem('demo_user', JSON.stringify({
        id: '1',
        email: formData.email,
        name: 'Demo User',
        role: 'admin'
      }))
      window.location.href = '/dashboard'
    }, 1500)
  }

  const handleDemoLogin = async () => {
    setIsDemoLoading(true)
    
    // For demo purposes, simulate demo login
    setTimeout(() => {
      localStorage.setItem('demo_user', JSON.stringify({
        id: 'demo',
        email: 'demo@nexopeak.com',
        name: 'Demo User',
        role: 'admin'
      }))
      window.location.href = '/dashboard'
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-orange-600 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Nexopeak
          </h2>
          <p className="text-gray-600">
            Digital Marketing Analytics Platform
          </p>
        </div>

        {/* Demo Notice */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-orange-800 font-medium mb-1">Demo Mode Active</p>
              <p className="text-orange-700">
                This is a frontend demo showcasing the beautiful orange color scheme and UI design. 
                The backend database is currently being configured. Use any credentials to explore the dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
          {/* Demo Login Button */}
          <div className="mb-6">
            <button
              onClick={handleDemoLogin}
              disabled={isDemoLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDemoLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Entering Demo...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Try Demo Dashboard
                </div>
              )}
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Instant access to explore the interface
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
            </div>
          </div>

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Enter any email to demo"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter any password to demo"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
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
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-lg py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign in to Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-orange-600 hover:text-orange-500">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
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
  )
}
