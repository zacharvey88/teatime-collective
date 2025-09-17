'use client'

import { useState } from 'react'
import AdminProtectedAuth from '@/components/AdminProtectedAuth'
import AdminSessionProvider from '@/components/AdminSessionProvider'
import AdminLayout from '@/components/AdminLayout'
import DashboardOverview from '@/components/admin/DashboardOverview'
import OrderManager from '@/components/admin/OrderManager'
import ImagesManager from '@/components/admin/ImagesManager'
import CakeManager from '@/components/admin/CakeManager'
import ReviewsManager from '@/components/admin/ReviewsManager'
import ContactManager from '@/components/admin/ContactManager'
import MarketManager from '@/components/admin/MarketManager'
import HolidayManager from '@/components/admin/HolidayManager'
import SettingsManager from '@/components/admin/SettingsManager'
import PasswordManager from '@/components/admin/PasswordManager'







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
      case 'reviews':
        return <ReviewsManager />
      case 'contact':
        return <ContactManager />
        case 'markets':
          return <MarketManager />
      case 'holidays':
        return <HolidayManager />
      case 'settings':
        return <SettingsManager />
      case 'admins':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Management</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Admin Users */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Current Admin Users</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Zac (Super Admin)</h4>
                  <p className="text-blue-700 text-sm">
                    <strong>Email:</strong> zac.harvey@gmail.com<br/>
                    <strong>Role:</strong> Super Admin<br/>
                    <strong>Status:</strong> Active
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Catherine (Admin)</h4>
                  <p className="text-green-700 text-sm">
                    <strong>Email:</strong> teatimecollective@hotmail.co.uk<br/>
                    <strong>Role:</strong> Admin<br/>
                    <strong>Status:</strong> Active
                  </p>
                </div>
              </div>

              {/* Password Change */}
              <div>
                <PasswordManager />
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Important Note</h4>
              <p className="text-yellow-700 text-sm">
                After changing your password, you'll need to restart the development server for the changes to take effect. 
                In production, the changes will be applied after the next deployment.
              </p>
            </div>
          </div>
        )
      default:
        return <DashboardOverview onSectionChange={handleSectionChange} />
    }
  }

  return (
    <AdminSessionProvider>
      <AdminProtectedAuth>
        <AdminLayout
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        >
          {renderActiveSection()}
        </AdminLayout>
      </AdminProtectedAuth>
    </AdminSessionProvider>
  )
} 