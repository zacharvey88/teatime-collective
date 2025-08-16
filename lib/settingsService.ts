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
  home_title?: string
  home_subheading?: string
  cakes_heading?: string
  order_heading?: string
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
  home_title?: string
  home_subheading?: string
  cakes_heading?: string
  order_heading?: string
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
      // First, get the current settings to get the ID
      const currentSettings = await this.getSettings()
      if (!currentSettings) {
        throw new Error('No settings found to update')
      }

      const { data, error } = await supabase
        .from('settings')
        .update({
          ...settingsData,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSettings.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating settings:', error)
        throw new Error(error.message)
      }

      return data
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