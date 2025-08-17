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
    CookieManager.acceptAll()
    setHasConsented(true)
  }

  const handleDeclineNonEssential = () => {
    CookieManager.declineNonEssential()
    setHasConsented(true)
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