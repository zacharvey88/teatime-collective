'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Calendar,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react'
import { MarketDatesService, MarketDate, CreateMarketDateData } from '@/lib/marketDatesService'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function MarketManager() {
  const [marketDates, setMarketDates] = useState<MarketDate[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingMarket, setEditingMarket] = useState<Partial<MarketDate>>({})
  const [newMarket, setNewMarket] = useState<Partial<MarketDate>>({
    name: '',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    url: '',
    active: true
  })
  const [repeatOptions, setRepeatOptions] = useState({
    enabled: false,
    frequency: 'weekly', // weekly, biweekly, monthly, bimonthly, custom
    customMonths: 1,
    count: 12 // number of repetitions
  })
  const [error, setError] = useState('')
  const [dialogError, setDialogError] = useState('')
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<MarketDate | null>(null)
  const [isAddFormVisible, setIsAddFormVisible] = useState(false)

  useEffect(() => {
    loadMarketDates()
  }, [])

  const loadMarketDates = async () => {
    try {
      setLoading(true)
      const dates = await MarketDatesService.getMarketDates()
      setMarketDates(dates)
    } catch (err: any) {
      setError(err.message || 'Failed to load market dates')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to calculate repeated dates
  const calculateRepeatedDates = (baseDate: string, frequency: string, customMonths: number, count: number): string[] => {
    const dates: string[] = []
    const base = new Date(baseDate)
    
    for (let i = 1; i < count; i++) {
      const newDate = new Date(base)
      
      switch (frequency) {
        case 'weekly':
          newDate.setDate(base.getDate() + (i * 7))
          break
        case 'biweekly':
          newDate.setDate(base.getDate() + (i * 14))
          break
        case 'monthly':
          newDate.setMonth(base.getMonth() + i)
          break
        case 'bimonthly':
          newDate.setMonth(base.getMonth() + (i * 2))
          break
        case 'custom':
          newDate.setMonth(base.getMonth() + (i * customMonths))
          break
      }
      
      dates.push(newDate.toISOString().split('T')[0])
    }
    
    return dates
  }

  const handleAddMarket = async () => {
    // Validate form first
    const validationError = validateMarketForm()
    if (validationError) {
      setDialogError(validationError)
      return
    }

    try {
      setLoading(true)
      setDialogError('') // Clear any previous errors
      
      if (repeatOptions.enabled) {
        // Create the base market
        const baseMarketData: CreateMarketDateData = {
          name: newMarket.name!,
          date: newMarket.date!,
          start_time: newMarket.start_time!,
          end_time: newMarket.end_time!,
          location: newMarket.location!,
          url: newMarket.url!,
          active: newMarket.active
        }
        
        await MarketDatesService.createMarketDate(baseMarketData)
        
        // Create repeated markets
        const repeatedDates = calculateRepeatedDates(
          newMarket.date!,
          repeatOptions.frequency,
          repeatOptions.customMonths,
          repeatOptions.count
        )
        
        for (const date of repeatedDates) {
          const repeatedMarketData: CreateMarketDateData = {
            name: newMarket.name!,
            date: date,
            start_time: newMarket.start_time!,
            end_time: newMarket.end_time!,
            location: newMarket.location!,
            url: newMarket.url!,
            active: newMarket.active
          }
          
          await MarketDatesService.createMarketDate(repeatedMarketData)
        }
        
        // Reset repeat options
        setRepeatOptions({
          enabled: false,
          frequency: 'weekly',
          customMonths: 1,
          count: 12
        })
      } else {
        // Create single market
        const marketData: CreateMarketDateData = {
          name: newMarket.name!,
          date: newMarket.date!,
          start_time: newMarket.start_time!,
          end_time: newMarket.end_time!,
          location: newMarket.location!,
          url: newMarket.url!,
          active: newMarket.active
        }

        await MarketDatesService.createMarketDate(marketData)
      }
      
      await loadMarketDates()
      resetForm()
    } catch (err: any) {
      setDialogError(err.message || 'Failed to add market date(s)')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMarket = async (id: string) => {
    try {
      await MarketDatesService.deleteMarketDate(id)
      await loadMarketDates()
    } catch (err: any) {
      setDialogError(err.message || 'Failed to delete market date')
    }
  }

  const handleDeleteClick = (market: MarketDate) => {
    setDeleteItem(market)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteItem) return
    
    try {
      await MarketDatesService.deleteMarketDate(deleteItem.id)
      await loadMarketDates()
      setIsDeleteDialogOpen(false)
      setDeleteItem(null)
    } catch (err: any) {
      setDialogError(err.message || 'Failed to delete market date')
    }
  }

  const handleEditMarket = (market: MarketDate) => {
    setEditingId(market.id)
    setEditingMarket({
      name: market.name,
      date: market.date,
      start_time: market.start_time,
      end_time: market.end_time,
      location: market.location,
      url: market.url,
      active: market.active
    })
  }

  const handleSaveMarket = async () => {
    if (!editingId) return

    try {
      await MarketDatesService.updateMarketDate(editingId, editingMarket)
      await loadMarketDates()
      setEditingId(null)
      setEditingMarket({})
      setDialogError('')
    } catch (err: any) {
      setDialogError(err.message || 'Failed to update market date')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingMarket({})
  }

  const resetForm = () => {
    setNewMarket({ name: '', date: '', start_time: '', end_time: '', location: '', url: '', active: true })
    setRepeatOptions({
      enabled: false,
      frequency: 'weekly',
      customMonths: 1,
      count: 12
    })
    setDialogError('')
    setIsAddFormVisible(false) // Hide the form after successful submission
  }

  // Validation functions
  const validateMarketForm = (): string | null => {
    // Check required fields
    if (!newMarket.name || !newMarket.date || !newMarket.start_time || !newMarket.end_time || !newMarket.location || !newMarket.url) {
      return 'Please fill in all required fields'
    }

    // Check if date is in the past
    const selectedDate = new Date(newMarket.date!)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for date comparison
    
    if (selectedDate < today) {
      return 'Market date cannot be in the past'
    }

    // Check if end time is after start time
    if (newMarket.start_time && newMarket.end_time) {
      const startTime = new Date(`2000-01-01T${newMarket.start_time}`)
      const endTime = new Date(`2000-01-01T${newMarket.end_time}`)
      
      if (endTime <= startTime) {
        return 'End time must be after start time'
      }
    }

    return null // No validation errors
  }

  const handleToggleActive = async (id: string) => {
    try {
      const market = marketDates.find(m => m.id === id)
      if (market) {
        await MarketDatesService.updateMarketDate(id, { active: !market.active })
        await loadMarketDates()
      }
    } catch (err: any) {
      setDialogError(err.message || 'Failed to toggle market status')
    }
  }

  const sortedMarkets = [...marketDates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray mb-2">Market Dates</h1>
        <p className="text-gray-600">Manage your market appearances and events</p>
      </div>



      {/* Add New Market Toggle Button */}
      {!isAddFormVisible && (
        <div className="mb-4">
          <Button 
            onClick={() => setIsAddFormVisible(true)}
            className="bg-orange hover:bg-orange-900 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Market
          </Button>
        </div>
      )}

      {/* Add New Market Form */}
      {isAddFormVisible && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange" />
              Add New Market
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray">Market Name</label>
                <Input
                  value={newMarket.name}
                  onChange={(e) => setNewMarket({ ...newMarket, name: e.target.value })}
                  placeholder="e.g., Manchester Food Market"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray">Date</label>
                <Input
                  type="date"
                  value={newMarket.date}
                  onChange={(e) => setNewMarket({ ...newMarket, date: e.target.value })}
                  className="mt-1"
                />
                {newMarket.date && new Date(newMarket.date) < new Date(new Date().setHours(0, 0, 0, 0)) && (
                  <p className="text-sm text-red-600 mt-1">Market date cannot be in the past</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray">Start Time</label>
                <Input
                  type="time"
                  value={newMarket.start_time}
                  onChange={(e) => setNewMarket({ ...newMarket, start_time: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray">End Time</label>
                <Input
                  type="time"
                  value={newMarket.end_time}
                  onChange={(e) => setNewMarket({ ...newMarket, end_time: e.target.value })}
                  className="mt-1"
                />
                {newMarket.start_time && newMarket.end_time && newMarket.start_time >= newMarket.end_time && (
                  <p className="text-sm text-red-600 mt-1">End time must be after start time</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray">Location</label>
                <Input
                  value={newMarket.location}
                  onChange={(e) => setNewMarket({ ...newMarket, location: e.target.value })}
                  placeholder="e.g., Albert Square, Manchester"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray">URL</label>
                <Input
                  value={newMarket.url}
                  onChange={(e) => setNewMarket({ ...newMarket, url: e.target.value })}
                  placeholder="e.g., https://www.themakersmarket.co.uk/pages/chorlton-makers-market"
                  className="mt-1"
                />
              </div>

            </div>
            
            {/* Repeat Options */}
            <div className="mt-6 pt-4 pr-4 pb-4 pl-0 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={repeatOptions.enabled}
                  onChange={(e) => setRepeatOptions({ ...repeatOptions, enabled: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Repeat this market</span>
              </div>
              
              {repeatOptions.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                    <select
                      value={repeatOptions.frequency}
                      onChange={(e) => setRepeatOptions({ ...repeatOptions, frequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="bimonthly">Bi-monthly</option>
                      <option value="custom">Custom months</option>
                    </select>
                  </div>
                  
                  {repeatOptions.frequency === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Months apart</label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={repeatOptions.customMonths}
                        onChange={(e) => setRepeatOptions({ ...repeatOptions, customMonths: parseInt(e.target.value) || 1 })}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of repetitions</label>
                    <Input
                      type="number"
                      min="1"
                      max="52"
                      value={repeatOptions.count}
                      onChange={(e) => setRepeatOptions({ ...repeatOptions, count: parseInt(e.target.value) || 1 })}
                      className="w-full"
                    />
                  </div>
                  
                </div>
              )}
            </div>
            
            {/* Dialog Error Display */}
            {dialogError && (
              <Alert className="border-red-200 bg-red-50 mt-4">
                <AlertDescription className="text-red-800 font-medium">
                  {dialogError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex items-center gap-4 mt-4">
              <Button 
                onClick={handleAddMarket}
                className="bg-orange hover:bg-orange-900 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Market
              </Button>
                                      <Button 
              type="button"
              variant="outline"
              onClick={() => setIsAddFormVisible(false)}
            >
              Cancel
            </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Markets List */}
      <div className="space-y-4">
        {sortedMarkets.map((market) => (
          <Card key={market.id} className={!market.active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-lg">
                      {editingId === market.id ? (
                        <Input
                          value={editingMarket.name || ''}
                          onChange={(e) => setEditingMarket({ ...editingMarket, name: e.target.value })}
                          className="text-lg font-bold"
                        />
                      ) : (
                        market.name
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {editingId === market.id ? (
                          <Input
                            type="date"
                            value={editingMarket.date || ''}
                            onChange={(e) => setEditingMarket({ ...editingMarket, date: e.target.value })}
                            className="text-sm"
                          />
                        ) : (
                          new Date(market.date).toLocaleDateString()
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {editingId === market.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="time"
                              value={editingMarket.start_time || ''}
                              onChange={(e) => setEditingMarket({ ...editingMarket, start_time: e.target.value })}
                              className="text-sm w-24"
                            />
                            <span>-</span>
                            <Input
                              type="time"
                              value={editingMarket.end_time || ''}
                              onChange={(e) => setEditingMarket({ ...editingMarket, end_time: e.target.value })}
                              className="text-sm w-24"
                            />
                          </div>
                        ) : (
                          `${market.start_time} - ${market.end_time}`
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {editingId === market.id ? (
                          <Input
                            value={editingMarket.location || ''}
                            onChange={(e) => setEditingMarket({ ...editingMarket, location: e.target.value })}
                            className="text-sm"
                          />
                        ) : (
                          market.location
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" />
                        {editingId === market.id ? (
                          <Input
                            value={editingMarket.url || ''}
                            onChange={(e) => setEditingMarket({ ...editingMarket, url: e.target.value })}
                            className="text-sm w-64"
                            placeholder="URL"
                          />
                        ) : (
                          market.url ? (
                            <a href={market.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              View Link
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">No URL</span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingId === market.id ? editingMarket.active : market.active}
                      onChange={() => {
                        if (editingId === market.id) {
                          setEditingMarket({ ...editingMarket, active: !editingMarket.active })
                        } else {
                          handleToggleActive(market.id)
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-600">Active</span>
                  </label>
                  {editingId === market.id ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveMarket}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMarket(market)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(market)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {marketDates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No market dates yet</h3>
            <p className="text-gray-500">Add your first market appearance to get started</p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-gray-700">
              {deleteItem && (
                <>
                  <p className="mb-2">
                    Are you sure you want to delete this market date?
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="font-medium text-red-800">
                      "{deleteItem.name}"
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      {new Date(deleteItem.date).toLocaleDateString()} at {deleteItem.location}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setDeleteItem(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Market
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 