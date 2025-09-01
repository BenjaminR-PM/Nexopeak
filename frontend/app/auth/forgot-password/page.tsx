'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Mail, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Zap,
  ArrowLeft
} from 'lucide-react'
import { RequireNoAuth } from '@/components/ProtectedRoute'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // For now, just show a success message
      // In a real implementation, you would call your backend API
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      setSuccess('If an account with that email exists, we\'ve sent you a password reset link.')
    } catch (err) {
      console.error('Forgot password error:', err)
      setError('Something went wrong. Please try again.')
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-600">Enter your email to receive a password reset link</p>
          </div>

          {/* Form */}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center mt-6">
              <Link 
                href="/auth/login" 
                className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RequireNoAuth>
  )
}
