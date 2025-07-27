// Debug utilities for local development

export const debugUtils = {
  // Log Supabase client state
  logSupabaseState: () => {
    if (typeof window !== 'undefined') {
      console.log('=== SUPABASE DEBUG INFO ===')
      console.log('localStorage keys:', Object.keys(localStorage))
      console.log('sessionStorage keys:', Object.keys(sessionStorage))
      
      // Check for Supabase-related storage
      const supabaseKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      )
      console.log('Supabase storage keys:', supabaseKeys)
      
      // Log any Supabase tokens
      supabaseKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key)
          console.log(`${key}:`, value ? 'EXISTS' : 'NULL')
        } catch (e) {
          console.log(`${key}: ERROR reading`)
        }
      })
    }
  },

  // Clear all Supabase-related storage
  clearSupabaseStorage: () => {
    if (typeof window !== 'undefined') {
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('sb-')
      )
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        console.log(`Removed: ${key}`)
      })
      
      sessionStorage.clear()
      console.log('Cleared sessionStorage')
    }
  },

  // Test image loading
  testImageLoading: async () => {
    try {
      const response = await fetch('/api/test-images')
      const data = await response.json()
      console.log('Image loading test result:', data)
      return data
    } catch (error) {
      console.error('Image loading test failed:', error)
      return null
    }
  }
}

// Auto-log in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Log on page load
  window.addEventListener('load', () => {
    console.log('=== PAGE LOADED ===')
    debugUtils.logSupabaseState()
  })
  
  // Log on storage changes
  window.addEventListener('storage', (event) => {
    console.log('=== STORAGE CHANGED ===', event)
    debugUtils.logSupabaseState()
  })
} 