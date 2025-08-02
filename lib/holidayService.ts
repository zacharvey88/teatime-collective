import { supabase } from './supabaseClient'

export interface Holiday {
  id: string
  name: string
  start_date: string
  end_date: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CreateHolidayData {
  name: string
  start_date: string
  end_date: string
  description?: string
}

export interface UpdateHolidayData {
  name?: string
  start_date?: string
  end_date?: string
  description?: string
}

export class HolidayService {
  static async getHolidays(): Promise<Holiday[]> {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .order('start_date', { ascending: true })

      if (error) {
        console.error('Error fetching holidays:', error)
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('Error in getHolidays:', error)
      throw error
    }
  }

  static async createHoliday(holidayData: CreateHolidayData): Promise<Holiday> {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .insert({
          ...holidayData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating holiday:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Error in createHoliday:', error)
      throw error
    }
  }

  static async updateHoliday(id: string, holidayData: UpdateHolidayData): Promise<Holiday> {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .update({
          ...holidayData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating holiday:', error)
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Error in updateHoliday:', error)
      throw error
    }
  }

  static async deleteHoliday(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting holiday:', error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Error in deleteHoliday:', error)
      throw error
    }
  }

  static async isDateBlocked(date: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .gte('start_date', date)
        .lte('end_date', date)

      if (error) {
        console.error('Error checking blocked date:', error)
        return false
      }

      return (data && data.length > 0)
    } catch (error) {
      console.error('Error in isDateBlocked:', error)
      return false
    }
  }
} 