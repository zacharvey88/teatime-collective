'use client'

import { useState, useEffect } from 'react'
import { AuthService } from '@/lib/auth'
import { RouteGuard } from '@/lib/routeGuard'
import { supabase } from '@/lib/supabaseClient'
import AdminLogin from '@/components/AdminLogin'

interface AdminProtectedProps {
  children: React.ReactNode
}

export default function AdminProtected({ children }: AdminProtectedProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    
    // Set up real-time auth state listener
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      console.log('AdminProtected: Auth state changed:', event, session)
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setIsLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          await checkAuth()
        } else {
          setIsAuthenticated(false)
          setIsLoading(false)
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
    try {
      // First, check if we have a session
      const session = await AuthService.getSession()
      console.log('Session check result:', !!session)
      
      if (!session) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }
      
      // If we have a session, check if user is admin with a shorter timeout
      const adminCheckPromise = AuthService.isAdmin()
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Admin check timeout')), 3000) // 3 second timeout
      })
      
      try {
        const isAdmin = await Promise.race([adminCheckPromise, timeoutPromise]) as boolean
        console.log('Admin check result:', isAdmin)
        
        setIsAuthenticated(isAdmin)
      } catch (adminError) {
        console.error('Admin check failed:', adminError)
        
        // If admin check fails, try to get user info directly
        try {
          const user = await AuthService.getCurrentUser()
          if (user) {
            console.log('User found, checking admin status in database...')
            
            // Direct database check with shorter timeout
            const directCheckPromise = supabase
              .from('admin_users')
              .select('is_active')
              .eq('email', user.email)
              .single()
            
            const directTimeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Direct check timeout')), 2000)
            })
            
            const result = await Promise.race([directCheckPromise, directTimeoutPromise]) as any
            
            const isActive = result?.data?.is_active === true
            if (isActive) {
              console.log('Direct check: User is admin')
              setIsAuthenticated(true)
            } else {
              console.log('Direct check: User is not admin')
              setIsAuthenticated(false)
            }
          } else {
            setIsAuthenticated(false)
          }
        } catch (directError) {
          console.error('Direct check failed:', directError)
          // If all checks fail, assume not admin
          setIsAuthenticated(false)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-cream">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />
  }

  return <>{children}</>
} 