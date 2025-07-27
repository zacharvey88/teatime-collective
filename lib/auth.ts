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

  // Check if user is admin
  static async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return false
      
      // Add timeout to the database query
      const adminCheckPromise = supabase
        .from('admin_users')
        .select('is_active')
        .eq('email', user.email)
        .single()
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Admin check timeout')), 3000) // 3 second timeout
      })
      
      const result = await Promise.race([adminCheckPromise, timeoutPromise]) as any
      
      return result?.data?.is_active || false
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  // Get current admin user details
  static async getCurrentAdmin(): Promise<AdminUser | null> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return null
      
      const { data } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .eq('is_active', true)
        .single()
      
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

  // Get user session
  static async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }

  // Listen to auth changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
} 