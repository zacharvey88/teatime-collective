'use client'

import { useState } from 'react'
import AdminProtected from '@/components/AdminProtected'
import AdminLayout from '@/components/AdminLayout'
import DashboardOverview from '@/components/admin/DashboardOverview'
import ImageManager from '@/components/admin/ImageManager'
import CakeManager from '@/components/admin/CakeManager'
import ContactManager from '@/components/admin/ContactManager'
import MarketManager from '@/components/admin/MarketManager'
import SettingsManager from '@/components/admin/SettingsManager'
import AdminManager from '@/components/admin/AdminManager'







export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard')

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
        return <CakeManager />
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
    <AdminProtected>
      <AdminLayout
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        {renderActiveSection()}
      </AdminLayout>
    </AdminProtected>
  )
} 