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
    try {
      const response = await fetch('/api/admin/contact-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update contact info')
      }

      const data = await response.json()
      
      // Ensure social_links is always an array
      return {
        ...data,
        social_links: data.social_links || []
      }
    } catch (error) {
      console.error('Error updating contact info:', error)
      throw error
    }
  }
} 