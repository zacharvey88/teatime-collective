'use client'

import { useState, useEffect } from 'react'
import { AuthService } from '@/lib/auth'
import AdminLogin from '@/components/AdminLogin'
import AdminLayout from '@/components/AdminLayout'
import DashboardOverview from '@/components/admin/DashboardOverview'
import ImageManager from '@/components/admin/ImageManager'
import CakeManager from '@/components/admin/CakeManager'
import ContactManager from '@/components/admin/ContactManager'
import MarketManager from '@/components/admin/MarketManager'
import SettingsManager from '@/components/admin/SettingsManager'
import AdminManager from '@/components/admin/AdminManager'

// Mock data - replace with actual Supabase data

const mockCakeFlavors = [
  {
    id: '1',
    name: 'Chocolate Fudge',
    description: 'Rich chocolate cake with fudge frosting',
    available: true,
    sizes: [
      { id: '1-1', name: '6 inch', price: 25, description: 'Serves 8-10 people' },
      { id: '1-2', name: '8 inch', price: 35, description: 'Serves 12-15 people' },
      { id: '1-3', name: '10 inch', price: 45, description: 'Serves 20-25 people' },
    ]
  },
  {
    id: '2',
    name: 'Vanilla Bean',
    description: 'Classic vanilla cake with buttercream',
    available: true,
    sizes: [
      { id: '2-1', name: '6 inch', price: 22, description: 'Serves 8-10 people' },
      { id: '2-2', name: '8 inch', price: 32, description: 'Serves 12-15 people' },
    ]
  }
] as any





export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')

  // State for all the data
  const [cakeFlavors, setCakeFlavors] = useState(mockCakeFlavors)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const session = await AuthService.getSession()
      if (session) {
        const isAdmin = await AuthService.isAdmin()
        setIsAuthenticated(isAdmin)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-cream">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview onSectionChange={setActiveSection} />
      case 'carousel':
        return (
          <ImageManager
            title="Carousel Images"
            type="carousel"
          />
        )
      case 'weddings':
        return (
          <ImageManager
            title="Wedding Images"
            type="weddings"
          />
        )
      case 'festivals':
        return (
          <ImageManager
            title="Festival Images"
            type="festivals"
          />
        )
      case 'cakes':
        return (
          <CakeManager
            flavors={cakeFlavors}
            onFlavorsChange={setCakeFlavors}
          />
        )
      case 'contact':
        return <ContactManager />
      case 'markets':
        return <MarketManager />
      case 'settings':
        return <SettingsManager />
      case 'admins':
        return <AdminManager />
      default:
        return <DashboardOverview onSectionChange={setActiveSection} />
    }
  }

  return (
    <AdminLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderActiveSection()}
    </AdminLayout>
  )
} 