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
      const user = await this.getCurrentUser()
      if (!user) {
        console.log('isAdmin: No user found')
        return false
      }

      console.log('isAdmin: Checking admin status for user:', user.email)

      // Check admin status in database using email (consistent with getCurrentAdmin)
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .eq('is_active', true)
        .single()

      if (error) {
        console.log('isAdmin: Database error:', error)
        return false
      }

      console.log('isAdmin: Admin user found:', data)
      return !!data
    } catch (error) {
      console.log('isAdmin: Exception:', error)
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
      console.log('isAuthenticated: Starting authentication check...')
      
      // Simple session check with timeout
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Authentication check timed out after 5 seconds')), 5000)
      })
      
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise])
      console.log('isAuthenticated: Session result:', !!session)
      return !!session
    } catch (error) {
      // If we get a timeout, try a different approach
      if (error instanceof Error && error.message.includes('timed out')) {
        try {
          // Try to get user directly with a shorter timeout
          const userPromise = supabase.auth.getUser()
          const userTimeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('User check timed out after 3 seconds')), 3000)
          })
          
          const { data: { user } } = await Promise.race([userPromise, userTimeoutPromise])
          return !!user
        } catch (altError) {
          // Last resort: check if we have session data in localStorage
          try {
            const hasLocalSession = localStorage.getItem('sb-kntdzvkvfyoiwjfnlvgg-auth-token')
            return !!hasLocalSession
          } catch (localError) {
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
      // Simple session retrieval with timeout
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Session retrieval timed out after 8 seconds')), 8000)
      })
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])
      
      if (error) throw error
      
      // If session exists but is close to expiring, refresh it
      if (session && session.expires_at) {
        const expiresAt = new Date(session.expires_at * 1000)
        const now = new Date()
        const timeUntilExpiry = expiresAt.getTime() - now.getTime()
        
        // If session expires in less than 5 minutes, refresh it
        if (timeUntilExpiry < 5 * 60 * 1000) {
          // Add timeout to session refresh
          const refreshPromise = supabase.auth.refreshSession()
          const refreshTimeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Session refresh timed out after 10 seconds')), 10000)
          })
          
          const { data: { session: refreshedSession }, error: refreshError } = await Promise.race([refreshPromise, refreshTimeoutPromise])
          
          if (refreshError) {
            return session // Return old session if refresh fails
          }
          return refreshedSession
        }
      }
      
      return session
    } catch (error) {
      throw error
    }
  }

  // Listen to auth changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
} 