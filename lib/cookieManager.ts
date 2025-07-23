// Cookie management utility for GDPR compliance

export interface CookiePreferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
}

export class CookieManager {
  private static readonly CONSENT_KEY = 'cookieConsent'
  private static readonly PREFERENCES_KEY = 'cookiePreferences'

  // Get user's cookie consent status
  static getConsentStatus(): 'accepted' | 'declined' | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.CONSENT_KEY) as 'accepted' | 'declined' | null
  }

  // Get user's detailed cookie preferences
  static getPreferences(): CookiePreferences {
    if (typeof window === 'undefined') {
      return { essential: true, analytics: false, marketing: false }
    }

    const stored = localStorage.getItem(this.PREFERENCES_KEY)
    if (stored) {
      return JSON.parse(stored)
    }

    // Default preferences (essential only)
    return { essential: true, analytics: false, marketing: false }
  }

  // Set cookie preferences
  static setPreferences(preferences: CookiePreferences): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences))
  }

  // Accept all cookies
  static acceptAll(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.CONSENT_KEY, 'accepted')
    this.setPreferences({
      essential: true,
      analytics: true,
      marketing: true
    })
  }

  // Decline non-essential cookies
  static declineNonEssential(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.CONSENT_KEY, 'declined')
    this.setPreferences({
      essential: true,
      analytics: false,
      marketing: false
    })
  }

  // Check if a specific cookie type is allowed
  static isAllowed(cookieType: keyof CookiePreferences): boolean {
    const preferences = this.getPreferences()
    return preferences[cookieType]
  }

  // Set a cookie with consent check
  static setCookie(name: string, value: string, options: {
    days?: number
    type: keyof CookiePreferences
  }): void {
    if (!this.isAllowed(options.type)) {
      return // Don't set cookie if not allowed
    }

    const { days = 365, type, ...rest } = options
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))

    const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
    document.cookie = cookieString
  }

  // Get a cookie value
  static getCookie(name: string): string | null {
    if (typeof window === 'undefined') return null

    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    
    return null
  }

  // Delete a cookie
  static deleteCookie(name: string): void {
    if (typeof window === 'undefined') return
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }

  // Clear all non-essential cookies
  static clearNonEssentialCookies(): void {
    if (typeof window === 'undefined') return
    
    const cookies = document.cookie.split(';')
    cookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim()
      // Keep essential cookies, remove others
      if (!name.startsWith('essential_')) {
        this.deleteCookie(name)
      }
    })
  }

  // Reset all cookie preferences
  static reset(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.CONSENT_KEY)
    localStorage.removeItem(this.PREFERENCES_KEY)
    this.clearNonEssentialCookies()
  }
} 