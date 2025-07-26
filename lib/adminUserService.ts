import { supabase } from './supabaseClient'
import { AdminUser } from './auth'

export interface CreateAdminUserData {
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer' | 'superadmin'
  permissions: Record<string, boolean>
}

export interface UpdateAdminUserData {
  name?: string
  role?: 'admin' | 'editor' | 'viewer' | 'superadmin'
  permissions?: Record<string, boolean>
  is_active?: boolean
}

export class AdminUserService {
  // Get all users
  static async getAdminUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw new Error(`Failed to fetch users: ${error.message}`)
    return data || []
  }

  // Get user by ID
  static async getAdminUser(id: string): Promise<AdminUser | null> {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw new Error(`Failed to fetch user: ${error.message}`)
    return data
  }

  // Create new user
  static async createAdminUser(adminData: CreateAdminUserData): Promise<AdminUser> {
    const { data, error } = await supabase
      .from('admin_users')
      .insert([adminData])
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create user: ${error.message}`)
    return data
  }

  // Update user
  static async updateAdminUser(id: string, updates: UpdateAdminUserData): Promise<AdminUser> {
    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update user: ${error.message}`)
    return data
  }

  // Delete user (soft delete by setting is_active to false)
  static async deleteAdminUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('admin_users')
      .update({ is_active: false })
      .eq('id', id)
    
    if (error) throw new Error(`Failed to delete user: ${error.message}`)
  }

  // Reactivate user
  static async reactivateAdminUser(id: string): Promise<AdminUser> {
    const { data, error } = await supabase
      .from('admin_users')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to reactivate user: ${error.message}`)
    return data
  }

  // Get predefined permission sets for different roles
  static getDefaultPermissions(role: 'admin' | 'editor' | 'viewer' | 'superadmin'): Record<string, boolean> {
    switch (role) {
      case 'admin':
        return {
          images_create: true,
          images_edit: true,
          images_delete: true,
          cakes_create: true,
          cakes_edit: true,
          cakes_delete: true,
          markets_create: true,
          markets_edit: true,
          markets_delete: true,
          orders_view: true,
          orders_edit: true,
          orders_delete: true,
          settings_edit: true,
          settings_view: true,
          contact_edit: true,
          contact_view: true,
          admins_manage: false // Only owner can manage admins
        }
      case 'editor':
        return {
          images_create: true,
          images_edit: true,
          images_delete: false,
          cakes_create: true,
          cakes_edit: true,
          cakes_delete: false,
          markets_create: true,
          markets_edit: true,
          markets_delete: false,
          orders_view: true,
          orders_edit: true,
          orders_delete: false,
          settings_edit: false,
          settings_view: true,
          contact_edit: true,
          contact_view: true,
          admins_manage: false
        }
              case 'viewer':
          return {
            images_create: false,
            images_edit: false,
            images_delete: false,
            cakes_create: false,
            cakes_edit: false,
            cakes_delete: false,
            markets_create: false,
            markets_edit: false,
            markets_delete: false,
            orders_view: true,
            orders_edit: false,
            orders_delete: false,
            settings_edit: false,
            settings_view: true,
            contact_edit: false,
            contact_view: true,
            admins_manage: false
          }
        case 'superadmin':
          return {
            images_create: true,
            images_edit: true,
            images_delete: true,
            cakes_create: true,
            cakes_edit: true,
            cakes_delete: true,
            markets_create: true,
            markets_edit: true,
            markets_delete: true,
            orders_view: true,
            orders_edit: true,
            orders_delete: true,
            settings_edit: true,
            settings_view: true,
            contact_edit: true,
            contact_view: true,
            admins_manage: true
          }
        default:
          return {}
    }
  }

  // Get all available permissions
  static getAvailablePermissions(): { key: string; label: string; description: string }[] {
    return [
      { key: 'images_create', label: 'Create Images', description: 'Upload new carousel, wedding, and festival images' },
      { key: 'images_edit', label: 'Edit Images', description: 'Modify image details and reorder images' },
      { key: 'images_delete', label: 'Delete Images', description: 'Remove images from the gallery' },
      { key: 'cakes_create', label: 'Create Cakes', description: 'Add new cake flavors and sizes' },
      { key: 'cakes_edit', label: 'Edit Cakes', description: 'Modify cake details and pricing' },
      { key: 'cakes_delete', label: 'Delete Cakes', description: 'Remove cake flavors and sizes' },
      { key: 'markets_create', label: 'Create Markets', description: 'Add new market dates and locations' },
      { key: 'markets_edit', label: 'Edit Markets', description: 'Modify market details and times' },
      { key: 'markets_delete', label: 'Delete Markets', description: 'Remove market dates' },
      { key: 'orders_view', label: 'View Orders', description: 'See order requests and customer data' },
      { key: 'orders_edit', label: 'Edit Orders', description: 'Modify order details and status' },
      { key: 'orders_delete', label: 'Delete Orders', description: 'Remove order requests' },
      { key: 'settings_edit', label: 'Edit Settings', description: 'Modify site settings and branding' },
      { key: 'settings_view', label: 'View Settings', description: 'See current site settings' },
      { key: 'contact_edit', label: 'Edit Contact', description: 'Update contact information' },
      { key: 'contact_view', label: 'View Contact', description: 'See contact information' },
      { key: 'admins_manage', label: 'Manage Users', description: 'Add, edit, and remove users (Superadmin only)' }
    ]
  }
} 