import { supabase } from './supabaseClient'

export interface SocialLink {
  id: string
  platform: string
  url: string
}

export interface ContactInfo {
  id: string
  email: string
  phone: string
  address_line1: string
  address_line2?: string
  address_line3?: string
  social_links?: SocialLink[]
  created_at?: string
  updated_at?: string
}

export interface UpdateContactInfoData {
  email: string
  phone: string
  address_line1: string
  address_line2?: string
  address_line3?: string
  social_links?: SocialLink[]
}

export class ContactInfoService {
  // Get contact info (frontend)
  static async getContactInfo(): Promise<ContactInfo | null> {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching contact info:', error)
      return null
    }
    
    // Ensure social_links is always an array
    return {
      ...data,
      social_links: data.social_links || []
    }
  }

  // Update contact info (admin)
  static async updateContactInfo(contactData: UpdateContactInfoData): Promise<ContactInfo> {
    // Get the first record (there should only be one)
    const { data: existing } = await supabase
      .from('contact_info')
      .select('id')
      .limit(1)
      .single()

    // Prepare data for database (ensure social_links is properly formatted)
    const dbData = {
      ...contactData,
      social_links: contactData.social_links || []
    }

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('contact_info')
        .update(dbData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating contact info:', error)
        throw new Error('Failed to update contact info')
      }
      
      // Ensure social_links is always an array
      return {
        ...data,
        social_links: data.social_links || []
      }
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('contact_info')
        .insert([dbData])
        .select()
        .single()

      if (error) {
        console.error('Error creating contact info:', error)
        throw new Error('Failed to create contact info')
      }
      
      // Ensure social_links is always an array
      return {
        ...data,
        social_links: data.social_links || []
      }
    }
  }
} 