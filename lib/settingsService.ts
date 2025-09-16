import { supabase } from './supabaseClient'

export interface Settings {
  id: string
  logo_url?: string
  order_email: string
  site_title: string
  site_description: string
  primary_color: string
  payment_notice?: string
  cart_notice?: string
  cake_search_enabled?: boolean
  cakes_subheading?: string
  order_subheading?: string
  show_order_form_notice?: boolean
  show_cart_notice?: boolean
  custom_order_notice?: string
  home_title?: string
  home_subheading?: string
  cakes_heading?: string
  order_heading?: string
  empty_cart_message?: string
  order_button_empty_text?: string
  order_button_active_text?: string
  festival_title?: string
  festival_subtitle?: string
  festival_content?: string
  wedding_title?: string
  wedding_subtitle?: string
  wedding_content?: string
  created_at?: string
  updated_at?: string
}

export interface UpdateSettingsData {
  logo_url?: string
  order_email: string
  site_title: string
  site_description: string
  primary_color: string
  payment_notice?: string
  cart_notice?: string
  cake_search_enabled?: boolean
  cakes_subheading?: string
  order_subheading?: string
  show_order_form_notice?: boolean
  show_cart_notice?: boolean
  custom_order_notice?: string
  home_title?: string
  home_subheading?: string
  cakes_heading?: string
  order_heading?: string
  empty_cart_message?: string
  order_button_empty_text?: string
  order_button_active_text?: string
  festival_title?: string
  festival_subtitle?: string
  festival_content?: string
  wedding_title?: string
  wedding_subtitle?: string
  wedding_content?: string
}

export class SettingsService {
  static async getSettings(): Promise<Settings | null> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single()

      if (error) {
        console.error('Error fetching settings:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getSettings:', error)
      return null
    }
  }

  static async updateSettings(settingsData: UpdateSettingsData): Promise<Settings | null> {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update settings')
      }

      return await response.json()
    } catch (error) {
      console.error('Error in updateSettings:', error)
      throw error
    }
  }

  static async uploadLogo(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${Date.now()}.${fileExt}`
      const filePath = `logos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading logo:', error)
      throw error
    }
  }
} 