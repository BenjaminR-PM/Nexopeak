'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/hooks/useSession'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  redirectTo = '/dashboard'
}) => {
  const { isAuthenticated, isLoading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return // Wait for session to load

    // Use a small delay to prevent rapid redirects
    const timeoutId = setTimeout(() => {
      if (requireAuth && !isAuthenticated) {
        // User needs to be authenticated but isn't
        router.push('/auth/login')
      } else if (!requireAuth && isAuthenticated) {
        // User is authenticated but shouldn't be on this page (e.g., login page)
        router.push(redirectTo)
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Don't render children if redirecting
  if (requireAuth && !isAuthenticated) {
    return null
  }

  if (!requireAuth && isAuthenticated) {
    return null
  }

  return <>{children}</>
}

// Convenience components for common use cases
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={true}>
    {children}
  </ProtectedRoute>
)

export const RequireNoAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireAuth={false}>
    {children}
  </ProtectedRoute>
)
