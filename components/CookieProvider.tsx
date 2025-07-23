'use client'

import { useEffect, useState } from 'react'
import CookieConsent from './CookieConsent'
import { CookieManager } from '@/lib/cookieManager'

interface CookieProviderProps {
  children: React.ReactNode
}

export default function CookieProvider({ children }: CookieProviderProps) {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user has already made a choice
    const consentStatus = CookieManager.getConsentStatus()
    setHasConsented(consentStatus !== null)
  }, [])

  const handleAccept = () => {
    CookieManager.acceptAll()
    setHasConsented(true)
    
    // Initialize analytics or other services here
    console.log('All cookies accepted')
  }

  const handleDecline = () => {
    CookieManager.declineNonEssential()
    setHasConsented(true)
    
    // Clear any existing non-essential cookies
    CookieManager.clearNonEssentialCookies()
    console.log('Non-essential cookies declined')
  }

  return (
    <>
      {children}
      {hasConsented === false && (
        <CookieConsent onAccept={handleAccept} onDecline={handleDecline} />
      )}
    </>
  )
} 