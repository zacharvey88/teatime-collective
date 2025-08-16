// Admin Tab Manager - Prevents conflicts between multiple admin tabs

class AdminTabManager {
  private static instance: AdminTabManager
  private tabId: string
  private isAdminTab: boolean = false

  constructor() {
    this.tabId = this.generateTabId()
    this.timestamp = Date.now()
    this.registerTab()
  }

  private registerTab() {
    if (typeof window !== 'undefined') {
      const key = `admin-tab-${this.tabId}`
      const tabInfo = {
        id: this.tabId,
        timestamp: this.timestamp
      }
      localStorage.setItem(key, JSON.stringify(tabInfo))
    }
  }

  cleanup() {
    if (typeof window !== 'undefined') {
      const key = `admin-tab-${this.tabId}`
      localStorage.removeItem(key)
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
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('admin-tab-')) {
          try {
            const tabInfo = JSON.parse(localStorage.getItem(key) || '{}')
            if (tabInfo.isAdmin) {
              
              // Check if the tab is recent enough to be considered active
              if (tabInfo.timestamp && (now - tabInfo.timestamp) < maxAge && tabInfo.timestamp <= now) {
                adminTabs.push(tabInfo.id)
              } else {
                // Remove stale tab entry or future timestamp
                localStorage.removeItem(key)
              }
            }
          } catch (e) {
            // Remove invalid JSON entries
            localStorage.removeItem(key)
          }
        }
      }
      
      return adminTabs
    } catch (error) {
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
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.warn('Failed to clear all admin tabs:', error)
    }
  }
}

export const adminTabManager = AdminTabManager.getInstance() 