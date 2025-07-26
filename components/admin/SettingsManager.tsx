'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Save, 
  Upload,
  Image as ImageIcon,
  Palette,
  Globe
} from 'lucide-react'
import { SettingsService, Settings, UpdateSettingsData } from '@/lib/settingsService'
import { useSettings } from '@/lib/settingsContext'

export default function SettingsManager() {
  const { settings, refreshSettings } = useSettings()
  const [localSettings, setLocalSettings] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Sync local settings with context settings
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleSave = async () => {
    if (!localSettings) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const settingsData: UpdateSettingsData = {
        logo_url: localSettings.logo_url,
        order_email: localSettings.order_email,
        site_title: localSettings.site_title,
        site_description: localSettings.site_description,
        primary_color: localSettings.primary_color
      }

      await SettingsService.updateSettings(settingsData)
      await refreshSettings() // Refresh the context to apply changes immediately
      setSuccess('Settings updated successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !localSettings) return

    try {
      setError('')
      const url = await SettingsService.uploadLogo(file)
      setLocalSettings(prev => prev ? { ...prev, logo_url: url } : null)
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo')
    }
  }

  const handleInputChange = (field: keyof Settings, value: string) => {
    if (!localSettings) return
    setLocalSettings(prev => prev ? { ...prev, [field]: value } : null)
  }

  if (!localSettings) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray mb-2">Settings</h1>
          <p className="text-gray-600">Manage your website settings and branding</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray mb-2">Settings</h1>
        <p className="text-gray-600">Manage your website settings and branding</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-orange" />
              Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                {localSettings.logo_url ? (
                  <img
                    src={localSettings.logo_url}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Button variant="outline" onClick={() => logoInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-xs text-gray-600 mt-1">
                  Recommended: 200x200px, PNG or SVG format
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange" />
              Order Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-gray">Email for Orders</label>
              <Input
                type="email"
                value={localSettings.order_email}
                onChange={(e) => handleInputChange('order_email', e.target.value)}
                placeholder="orders@teatimecollective.co.uk"
                className="mt-1"
              />
              <p className="text-xs text-gray-600 mt-1">
                This email will receive all order notifications
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Site Information */}
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray">Site Title</label>
              <Input
                value={localSettings.site_title}
                onChange={(e) => handleInputChange('site_title', e.target.value)}
                placeholder="Teatime Collective - Delicious Vegan Cakes"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray">Site Description</label>
              <Input
                value={localSettings.site_description}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                placeholder="Vegan Cakes and Bakes, Festival Caterers and Market Traders since 2013."
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-orange" />
              Branding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="text-sm font-medium text-gray">Primary Color</label>
              <div className="flex items-center gap-3 mt-1">
                <Input
                  type="color"
                  value={localSettings.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={localSettings.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  placeholder="#FF6B35"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                This color will be used throughout the website
              </p>
            </div>
          </CardContent>
        </Card>
      </div>



      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-orange hover:bg-orange-900 text-white"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 
