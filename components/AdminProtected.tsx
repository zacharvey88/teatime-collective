'use client'

import { useState, useEffect, useRef } from 'react'
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

  useEffect(() => {
    checkAuth()
    
    // Set up real-time auth state listener
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        // Show logout screen and redirect after a moment
        setIsLoggingOut(true)
        setIsAuthenticated(false)
        setIsLoading(false)
        setAuthError(null)
        
        // Redirect to login page after showing logout screen briefly
        setTimeout(() => {
          window.location.href = '/admin'
        }, 1500)
      } else if (event === 'SIGNED_IN' && session) {
        // Only check auth if we don't have a session and we're not already checking
        if (!isAuthenticated && !isCheckingAuth.current) {
          console.log('🔍 Auth state change detected, triggering auth check...')
          checkAuth()
        } else {
          console.log('🔒 Skipping auth check - already authenticated or check in progress')
        }
      }
    })

    // Set up navigation guard
    const cleanupNavigationGuard = RouteGuard.setupNavigationGuard()

    // Cleanup subscriptions on unmount
    return () => {
      subscription.unsubscribe()
      cleanupNavigationGuard()
    }
  }, [])

  const checkAuth = async () => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth.current) {
      console.log('🔒 Authentication check already in progress, skipping...')
      return
    }

    try {
      console.log('🔍 Starting authentication check...')
      isCheckingAuth.current = true
      setIsLoading(true)
      setAuthError(null)
      
      console.log('🔍 Step 1: Checking if user is authenticated...')
      // Fast authentication check (no network calls)
      const isAuth = await AuthService.isAuthenticated()
      console.log('🔍 Authentication result:', isAuth)
      
      if (!isAuth) {
        console.log('🔍 User not authenticated')
        setIsAuthenticated(false)
        setIsLoading(false)
        // Don't set authError for normal "not authenticated" state
        return
      }
      
      console.log('🔍 Step 2: Checking admin status...')
      // Simple admin check - no complex timeouts
      const isAdmin = await AuthService.isAdmin()
      console.log('🔍 Admin check result:', isAdmin)
      
      setIsAuthenticated(isAdmin)
      setIsLoading(false)
      
      if (!isAdmin) {
        setAuthError('User is not an admin')
      }
      
      console.log('🔍 Authentication check completed successfully')
      
    } catch (error) {
      console.error('❌ Authentication check failed:', error)
      setIsAuthenticated(false)
      setIsLoading(false)
      setAuthError('Authentication failed')
    } finally {
      isCheckingAuth.current = false
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setAuthError(null)
  }

  const handleRetry = () => {
    checkAuth()
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