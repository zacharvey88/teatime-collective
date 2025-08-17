'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AuthService } from '@/lib/auth'
import { RouteGuard } from '@/lib/routeGuard'
import AdminLogin from '@/components/AdminLogin'
import { Button } from '@/components/ui/button'

interface AdminProtectedProps {
  children: React.ReactNode
}

export default function AdminProtected({ children }: AdminProtectedProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const isCheckingAuth = useRef(false)



    // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsLoggingOut(true) // Show logout screen
        setIsAuthenticated(false)
        setIsLoading(false)
        setAuthError(null)
        setTimeout(() => { // Redirect after showing logout screen
          window.location.href = '/admin'
        }, 1500)
      } else if (event === 'SIGNED_IN' && session) {
        if (!isAuthenticated && !isCheckingAuth.current) {
          checkAuth()
        }
      }
    })

    // Also trigger an initial auth check
    checkAuth()
    
    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      setIsLoading(false)
      setAuthError('Authentication check timed out. Please refresh the page.')
    }, 10000) // 10 second fallback

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallbackTimeout)
    }
  }, [isAuthenticated])

  const checkAuth = useCallback(async () => {
    if (isCheckingAuth.current) {
      return
    }

    isCheckingAuth.current = true
    setIsLoading(true)
    setAuthError(null)

    try {
      const isAuth = await AuthService.isAuthenticated()
      
      if (!isAuth) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      const isAdmin = await AuthService.isAdmin()
      
      if (isAdmin) {
        setIsAuthenticated(true)
        setIsLoading(false)
      } else {
        setAuthError('Access denied. Admin privileges required.')
        setIsAuthenticated(false)
        setIsLoading(false)
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed')
      setIsAuthenticated(false)
      setIsLoading(false)
    } finally {
      isCheckingAuth.current = false
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setAuthError(null)
  }

  const handleRetry = () => {
    checkAuth()
  }

  if (isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-cream">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Signing Out...</h2>
          <p className="text-gray-600">Please wait while we securely log you out.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-cream">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-cream">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{authError}</p>
          <div className="space-y-2">
            <Button onClick={handleRetry} className="w-full">
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'} 
              className="w-full"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />
  }

  return <>{children}</>
} 