'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { SettingsService, Settings } from './settingsService'

interface SettingsContextType {
  settings: Settings | null
  loading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await SettingsService.getSettings()
      setSettings(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load settings')
      console.error('Error loading settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshSettings = async () => {
    await loadSettings()
  }

  useEffect(() => {
    loadSettings()
  }, [])

  // Apply primary color to CSS custom property when settings change
  useEffect(() => {
    if (settings?.primary_color) {
      document.documentElement.style.setProperty('--primary-color', settings.primary_color)
    }
  }, [settings?.primary_color])

  const value = {
    settings,
    loading,
    error,
    refreshSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
} 