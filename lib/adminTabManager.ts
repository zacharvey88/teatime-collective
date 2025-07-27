// Admin Tab Manager - Prevents conflicts between multiple admin tabs

class AdminTabManager {
  private static instance: AdminTabManager
  private tabId: string
  private isAdminTab: boolean = false

  constructor() {
    // Generate unique tab ID
    this.tabId = `admin-tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  static getInstance(): AdminTabManager {
    if (!AdminTabManager.instance) {
      AdminTabManager.instance = new AdminTabManager()
    }
    return AdminTabManager.instance
  }

  // Initialize this tab as an admin tab
  initializeAsAdminTab(): void {
    try {
      this.isAdminTab = true
      this.setTabInfo()
      
      // Clean up when tab is closed
      window.addEventListener('beforeunload', this.cleanup.bind(this))
      
      console.log(`Admin tab initialized: ${this.tabId}`)
    } catch (error) {
      console.warn('Failed to initialize admin tab manager:', error)
      // Continue without tab management if it fails
      this.isAdminTab = true
    }
  }

  // Set tab information in storage
  private setTabInfo(): void {
    if (typeof window !== 'undefined') {
      try {
        const tabInfo = {
          id: this.tabId,
          timestamp: Date.now(),
          isAdmin: true
        }
        localStorage.setItem(`admin-tab-${this.tabId}`, JSON.stringify(tabInfo))
      } catch (error) {
        console.warn('Failed to set tab info in localStorage:', error)
        // Continue without storage if it fails (e.g., in incognito mode)
      }
    }
  }



  // Clear admin-related storage for this tab
  private clearAdminStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        // Remove this tab's info
        localStorage.removeItem(`admin-tab-${this.tabId}`)
        
        // Clear any admin-specific storage
        const keysToRemove = Object.keys(localStorage).filter(key => 
          key.startsWith('admin-') || key.includes('admin')
        )
        keysToRemove.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.warn('Failed to clear admin storage:', error)
      }
    }
  }

  // Cleanup when tab is closed
  private cleanup(): void {
    if (this.isAdminTab) {
      try {
        localStorage.removeItem(`admin-tab-${this.tabId}`)
        console.log(`Admin tab cleanup: ${this.tabId}`)
      } catch (error) {
        console.warn('Failed to cleanup admin tab:', error)
      }
    }
  }

  // Get tab ID
  getTabId(): string {
    return this.tabId
  }

  // Check if this is an admin tab
  isAdminTabActive(): boolean {
    return this.isAdminTab
  }



  // Get all active admin tabs
  getActiveAdminTabs(): string[] {
    if (typeof window === 'undefined') return []
    
    try {
      const adminTabs: string[] = []
      const now = Date.now()
      const maxAge = 5 * 60 * 1000 // 5 minutes - tabs older than this are considered stale
      
      console.log('Checking for active admin tabs, current time:', now)
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('admin-tab-')) {
          try {
            const tabInfo = JSON.parse(localStorage.getItem(key) || '{}')
            if (tabInfo.isAdmin) {
              console.log(`Found admin tab: ${tabInfo.id}, timestamp: ${tabInfo.timestamp}, age: ${now - tabInfo.timestamp}ms`)
              
              // Check if the tab is recent enough to be considered active
              if (tabInfo.timestamp && (now - tabInfo.timestamp) < maxAge && tabInfo.timestamp <= now) {
                adminTabs.push(tabInfo.id)
                console.log(`Tab ${tabInfo.id} is active`)
              } else {
                // Remove stale tab entry or future timestamp
                const age = now - tabInfo.timestamp
                console.log(`Removing admin tab: ${tabInfo.id}, age: ${age}ms, timestamp: ${tabInfo.timestamp}, now: ${now}`)
                localStorage.removeItem(key)
              }
            }
          } catch (e) {
            // Remove invalid JSON entries
            console.log(`Removing invalid admin tab entry: ${key}`)
            localStorage.removeItem(key)
          }
        }
      }
      
      console.log('Active admin tabs:', adminTabs)
      return adminTabs
    } catch (error) {
      console.warn('Failed to get active admin tabs:', error)
      return []
    }
  }

  // Force clear all admin tab data (useful for debugging)
  clearAllAdminTabs(): void {
    if (typeof window === 'undefined') return
    
    try {
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('admin-tab-')
      )
      keysToRemove.forEach(key => {
        console.log(`Clearing admin tab: ${key}`)
        localStorage.removeItem(key)
      })
      console.log('All admin tab data cleared')
    } catch (error) {
      console.warn('Failed to clear all admin tabs:', error)
    }
  }
}

export const adminTabManager = AdminTabManager.getInstance() 