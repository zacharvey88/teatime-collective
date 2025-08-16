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

  const handleAcceptAll = () => {
    setCookieConsent('all')
    setShowBanner(false)
    // Store consent in localStorage
    localStorage.setItem('cookie-consent', 'all')
  }

  const handleDeclineNonEssential = () => {
    setCookieConsent('essential')
    setShowBanner(false)
    // Store consent in localStorage
    localStorage.setItem('cookie-consent', 'essential')
  }

  return (
    <>
      {children}
      {hasConsented === false && (
        <CookieConsent onAccept={handleAcceptAll} onDecline={handleDeclineNonEssential} />
      )}
    </>
  )
} 