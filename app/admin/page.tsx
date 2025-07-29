'use client'

import { useState } from 'react'
import AdminProtected from '@/components/AdminProtected'
import AdminLayout from '@/components/AdminLayout'
import DashboardOverview from '@/components/admin/DashboardOverview'
import OrderManager from '@/components/admin/OrderManager'
import ImagesManager from '@/components/admin/ImagesManager'
import CakeManager from '@/components/admin/CakeManager'
import ContactManager from '@/components/admin/ContactManager'
import MarketManager from '@/components/admin/MarketManager'
import SettingsManager from '@/components/admin/SettingsManager'
import AdminManager from '@/components/admin/AdminManager'







export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [orderFilter, setOrderFilter] = useState<string | null>(null)

  const handleSectionChange = (section: string, filter?: string) => {
    setActiveSection(section)
    if (filter) {
      setOrderFilter(filter)
    } else {
      setOrderFilter(null)
    }
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview onSectionChange={handleSectionChange} />
      case 'orders':
        return <OrderManager initialStatusFilter={orderFilter} />
      case 'images':
        return <ImagesManager />
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
        return <DashboardOverview onSectionChange={handleSectionChange} />
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