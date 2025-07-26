import { supabase } from './supabaseClient'

export interface ContactInfo {
  id: string
  email: string
  phone: string
  address_line1: string
  address_line2?: string
  address_line3?: string
  instagram_url?: string
  facebook_url?: string
  created_at?: string
  updated_at?: string
}

export interface UpdateContactInfoData {
  email: string
  phone: string
  address_line1: string
  address_line2?: string
  address_line3?: string
  instagram_url?: string
  facebook_url?: string
}

export class ContactInfoService {
  // Get contact info (frontend)
  static async getContactInfo(): Promise<ContactInfo | null> {
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .limit(1)
      .single()

    if (error) throw new Error('Failed to fetch contact info')
    return data
  }

  // Update contact info (admin)
  static async updateContactInfo(contactData: UpdateContactInfoData): Promise<ContactInfo> {
    // Get the first record (there should only be one)
    const { data: existing } = await supabase
      .from('contact_info')
      .select('id')
      .limit(1)
      .single()

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('contact_info')
        .update(contactData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw new Error('Failed to update contact info')
      return data
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('contact_info')
        .insert([contactData])
        .select()
        .single()

      if (error) throw new Error('Failed to create contact info')
      return data
    }
  }
} 