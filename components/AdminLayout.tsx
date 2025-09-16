'use client'

import { useState, useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { adminTabManager } from '@/lib/adminTabManager'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  CakeSlice, 
  Mail, 
  MapPin, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Home,
  ShoppingCart,
  Calendar,
  Star,
  Store
} from 'lucide-react'
import Image from 'next/image'
import { useSettings } from '@/lib/settingsContext'
import { supabase } from '@/lib/supabaseClient'

interface AdminLayoutProps {
  children: React.ReactNode
  activeSection: string
  onSectionChange: (section: string) => void
}

const baseNavigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'images', label: 'Images', icon: ImageIcon },
  { id: 'cakes', label: 'Cake Management', icon: CakeSlice },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'contact', label: 'Contact Info', icon: Mail },
  { id: 'markets', label: 'Markets', icon: Store },
  { id: 'holidays', label: 'Holidays', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children, activeSection, onSectionChange }: AdminLayoutProps) {
  const { data: session } = useSession()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [canManageAdmins, setCanManageAdmins] = useState(false)
  const { settings } = useSettings()

  useEffect(() => {
    // With hardcoded admin user, always allow admin management
    setCanManageAdmins(true)
  }, [])

  // Set sidebar collapsed by default on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) { // lg breakpoint
        setSidebarCollapsed(true)
      }
    }

    // Set initial state
    handleResize()

    // Add event listener for window resize
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/admin/login' })
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Build navigation items dynamically based on permissions
  const navigationItems = [
    ...baseNavigationItems,
    ...(canManageAdmins ? [{ id: 'admins', label: 'User Management', icon: Users }] : [])
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-30 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
                    <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className={`flex items-center transition-all duration-300 ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                {!sidebarCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold text-orange">
                      Admin Panel
                    </h1>
                    {session?.user?.name && (
                      <p className="text-sm text-gray-600 mt-1">
                        Welcome, {session.user.name}
                      </p>
                    )}
                  </div>
                )}
                {sidebarCollapsed && (
                  <button
                    onClick={() => setSidebarCollapsed(false)}
                    className="hover:bg-gray-100 rounded-lg transition-colors p-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              {!sidebarCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {/* Back to Site Button */}
            <button
              onClick={() => window.location.href = '/'}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-orange/10 hover:text-orange ${
                sidebarCollapsed ? 'justify-center space-x-0' : 'justify-start space-x-3'
              }`}
              title="Back to Site"
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Back to Site</span>}
            </button>
            
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-orange text-white'
                      : 'text-gray-600 hover:bg-orange/10 hover:text-orange'
                  } ${sidebarCollapsed ? 'justify-center space-x-0' : 'justify-start space-x-3'}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className={`w-full text-gray-600 hover:text-red-600 hover:bg-red-50 flex items-center ${
                sidebarCollapsed ? 'justify-center' : 'justify-start'
              }`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="ml-2">Sign Out</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-6 bg-white rounded-lg shadow-sm m-4">
          {children}
        </div>
      </div>
    </div>
  )
} 