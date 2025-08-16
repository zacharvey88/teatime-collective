import { supabase } from './supabaseClient'

export interface User {
  id: string
  email: string
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'superadmin' | 'admin' | 'editor' | 'viewer'
  permissions: Record<string, boolean>
  is_active: boolean
  created_at: string
  updated_at: string
}

export class AuthService {
  // Sign in with email and password
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // Get current user
  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  // Check if current user is an admin
  static async isAdmin(): Promise<boolean> {
    try {
      console.log('🔍 AuthService.isAdmin: Starting...')
      
      // First check if user is authenticated (fast)
      const isAuth = await this.isAuthenticated()
      if (!isAuth) {
        console.log('🔍 AuthService.isAdmin: User not authenticated')
        return false
      }
      
      // Get current user for admin check
      const user = await this.getCurrentUser()
      console.log('🔍 AuthService.isAdmin: Got user:', !!user)
      
      if (!user) return false
      
      console.log('🔍 AuthService.isAdmin: Checking admin status in database...')
      
      // Add timeout specifically to the database query
      const databasePromise = supabase
        .from('admin_users')
        .select('is_active')
        .eq('email', user.email)
        .single()
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database query timed out after 10 seconds')), 10000)
      })
      
      const { data, error } = await Promise.race([databasePromise, timeoutPromise])
      
      console.log('🔍 AuthService.isAdmin: Database response received, error:', !!error)
      
      if (error) {
        console.error('❌ AuthService.isAdmin: Database error:', error)
        return false
      }
      
      const result = data?.is_active || false
      console.log('🔍 AuthService.isAdmin: Admin status result:', result)
      return result
    } catch (error) {
      console.error('❌ AuthService.isAdmin: Error:', error)
      return false
    }
  }

  // Get current admin user details
  static async getCurrentAdmin(): Promise<AdminUser | null> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return null
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .eq('is_active', true)
        .single()
      
      if (error) {
        console.error('Database error getting admin details:', error)
        return null
      }
      
      return data || null
    } catch (error) {
      console.error('Error getting current admin:', error)
      return null
    }
  }

  // Check if user has specific permission
  static async hasPermission(permission: string): Promise<boolean> {
    try {
      const admin = await this.getCurrentAdmin()
      if (!admin) return false
      
      // Superadmin has all permissions
      if (admin.role === 'superadmin') return true
      
      return admin.permissions[permission] || false
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }

  // Check if user can manage other admins
  static async canManageAdmins(): Promise<boolean> {
    try {
      const admin = await this.getCurrentAdmin()
      return admin?.role === 'superadmin' || false
    } catch (error) {
      console.error('Error checking admin management permission:', error)
      return false
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      console.log('🔍 AuthService.isAuthenticated: Starting...')
      
      // Simple session check with timeout
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Authentication check timed out after 5 seconds')), 5000)
      })
      
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise])
      const authenticated = !!session
      
      console.log('🔍 AuthService.isAuthenticated: Result:', authenticated)
      return authenticated
    } catch (error) {
      console.log('🔍 AuthService.isAuthenticated: Error:', error)
      
      // If we get a timeout, try a different approach
      if (error instanceof Error && error.message.includes('timed out')) {
        console.log('🔍 AuthService.isAuthenticated: Timeout detected, trying alternative method...')
        
        try {
          // Try to get user directly with a shorter timeout
          const userPromise = supabase.auth.getUser()
          const userTimeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('User check timed out after 3 seconds')), 3000)
          })
          
          const { data: { user } } = await Promise.race([userPromise, userTimeoutPromise])
          const hasUser = !!user
          
          console.log('🔍 AuthService.isAuthenticated: Alternative method result:', hasUser)
          return hasUser
        } catch (altError) {
          console.log('🔍 AuthService.isAuthenticated: Alternative method also failed:', altError)
          
          // Last resort: check if we have session data in localStorage
          try {
            const hasLocalSession = localStorage.getItem('sb-kntdzvkvfyoiwjfnlvgg-auth-token')
            console.log('🔍 AuthService.isAuthenticated: LocalStorage fallback result:', !!hasLocalSession)
            return !!hasLocalSession
          } catch (localError) {
            console.log('🔍 AuthService.isAuthenticated: LocalStorage check failed:', localError)
            return false
          }
        }
      }
      
      return false
    }
  }

  // Get user session (only when needed for API calls)
  static async getSession() {
    try {
      console.log('🔍 AuthService.getSession: Starting...')
      
      // Simple session retrieval with timeout
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Session retrieval timed out after 8 seconds')), 8000)
      })
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])
      console.log('🔍 AuthService.getSession: Got response, error:', !!error)
      
      if (error) throw error
      
      // If session exists but is close to expiring, refresh it
      if (session && session.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000)
        const now = new Date()
        const timeUntilExpiry = expiresAt.getTime() - now.getTime()
        
        // If session expires in less than 5 minutes, refresh it
        if (timeUntilExpiry < 5 * 60 * 1000) {
          console.log('🔍 AuthService.getSession: Session expiring soon, refreshing...')
          
          // Add timeout to session refresh
          const refreshPromise = supabase.auth.refreshSession()
          const refreshTimeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Session refresh timed out after 10 seconds')), 10000)
          })
          
          const { data: { session: refreshedSession }, error: refreshError } = await Promise.race([refreshPromise, refreshTimeoutPromise])
          
          if (refreshError) {
            console.error('❌ AuthService.getSession: Session refresh failed:', refreshError)
            return session // Return old session if refresh fails
          }
          console.log('🔍 AuthService.getSession: Session refreshed successfully')
          return refreshedSession
        }
      }
      
      console.log('🔍 AuthService.getSession: Returning session:', !!session)
      return session
    } catch (error) {
      console.error('❌ AuthService.getSession: Error:', error)
      throw error
    }
  }

  // Listen to auth changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
} 