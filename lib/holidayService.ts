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
      const response = await fetch('/api/admin/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holidayData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create holiday')
      }

      return await response.json()
    } catch (error) {
      console.error('Error in createHoliday:', error)
      throw error
    }
  }

  static async updateHoliday(id: string, holidayData: UpdateHolidayData): Promise<Holiday> {
    try {
      const response = await fetch(`/api/admin/holidays/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(holidayData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update holiday')
      }

      return await response.json()
    } catch (error) {
      console.error('Error in updateHoliday:', error)
      throw error
    }
  }

  static async deleteHoliday(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/holidays/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete holiday')
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