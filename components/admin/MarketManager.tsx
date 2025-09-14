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
  ExternalLink,
  Building2,
  Globe,
  X
} from 'lucide-react'
import { MarketService, Market, CreateMarketData } from '@/lib/marketService'
import { MarketDatesService, MarketDate, CreateMarketDateData } from '@/lib/marketDatesService'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function MarketManager() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [marketDates, setMarketDates] = useState<MarketDate[]>([])
  const [editingMarketId, setEditingMarketId] = useState<string | null>(null)
  const [editingMarket, setEditingMarket] = useState<Partial<Market>>({})
  const [editingDateId, setEditingDateId] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState<Partial<MarketDate>>({})
  const [newMarket, setNewMarket] = useState<Partial<Market> & { dates?: Array<{ date: string; start_time: string; end_time: string }> }>({
    name: '',
    location: '',
    url: '',
    active: true,
    dates: []
  })
  const [newDate, setNewDate] = useState<Partial<MarketDate>>({
    market_id: '',
    date: '',
    start_time: '',
    end_time: ''
  })
  const [expandedMarkets, setExpandedMarkets] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [dialogError, setDialogError] = useState('')
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<{ type: 'market' | 'date', item: Market | MarketDate } | null>(null)
  const [isAddMarketFormVisible, setIsAddMarketFormVisible] = useState(false)
  const [isAddDateFormVisible, setIsAddDateFormVisible] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [marketsData, datesData] = await Promise.all([
        MarketService.getMarkets(),
        MarketDatesService.getMarketDates()
      ])
      setMarkets(marketsData)
      setMarketDates(datesData)
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMarket = async () => {
    if (!newMarket.name?.trim() || !newMarket.location?.trim()) {
      setError('Name and location are required')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const marketData: CreateMarketData = {
        name: newMarket.name.trim(),
        location: newMarket.location.trim(),
        url: newMarket.url?.trim() || undefined,
        active: newMarket.active ?? true
      }

      const createdMarket = await MarketService.createMarket(marketData)
      
      // Add dates if provided
      if (newMarket.dates && newMarket.dates.length > 0) {
        const validDates = newMarket.dates.filter(date => date.date && date.start_time && date.end_time)
        if (validDates.length > 0) {
          await Promise.all(
            validDates.map(date => 
              MarketDatesService.createMarketDate({
                market_id: createdMarket.id,
                date: date.date,
                start_time: date.start_time,
                end_time: date.end_time
              })
            )
          )
        }
      }
      
      await loadData()
      setNewMarket({
        name: '',
        location: '',
        url: '',
        active: true,
        dates: []
      })
      setIsAddMarketFormVisible(false)
    } catch (err) {
      console.error('Error adding market:', err)
      setError('Failed to add market')
    } finally {
      setLoading(false)
    }
  }

  const handleEditMarket = async () => {
    if (!editingMarketId || !editingMarket.name?.trim() || !editingMarket.location?.trim()) {
      setError('Name and location are required')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      await MarketService.updateMarket(editingMarketId, {
        name: editingMarket.name.trim(),
        location: editingMarket.location.trim(),
        url: editingMarket.url?.trim() || undefined,
        active: editingMarket.active ?? true
      })
      
      await loadData()
      setEditingMarketId(null)
      setEditingMarket({})
    } catch (err) {
      console.error('Error updating market:', err)
      setError('Failed to update market')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMarket = async () => {
    if (!deleteItem?.item) return

    try {
      setLoading(true)
      await MarketService.deleteMarket(deleteItem.item.id)
      await loadData()
      setIsDeleteDialogOpen(false)
      setDeleteItem(null)
    } catch (err) {
      console.error('Error deleting market:', err)
      setError('Failed to delete market')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMarketActive = async (marketId: string, active: boolean) => {
    try {
      await MarketService.updateMarket(marketId, { active })
      await loadData()
    } catch (err) {
      console.error('Error toggling market active status:', err)
      setError('Failed to update market status')
    }
  }

  const handleAddDate = async () => {
    if (!newDate.market_id || !newDate.date || !newDate.start_time || !newDate.end_time) {
      setDialogError('Date, start time, and end time are required')
      return
    }

    try {
      setLoading(true)
      setDialogError('')
      
      await MarketDatesService.createMarketDate({
        market_id: newDate.market_id,
        date: newDate.date,
        start_time: newDate.start_time,
        end_time: newDate.end_time
      })
      
      await loadData()
      setNewDate({
        market_id: '',
        date: '',
        start_time: '',
        end_time: ''
      })
      setIsAddDateFormVisible(false)
    } catch (err) {
      console.error('Error adding date:', err)
      setDialogError('Failed to add date')
    } finally {
      setLoading(false)
    }
  }

  const handleEditDate = async () => {
    if (!editingDateId || !editingDate.market_id || !editingDate.date || !editingDate.start_time || !editingDate.end_time) {
      setDialogError('All fields are required')
      return
    }

    try {
      setLoading(true)
      setDialogError('')
      
      await MarketDatesService.updateMarketDate(editingDateId, {
        market_id: editingDate.market_id,
        date: editingDate.date,
        start_time: editingDate.start_time,
        end_time: editingDate.end_time
      })
      
      await loadData()
      setEditingDateId(null)
      setEditingDate({})
    } catch (err) {
      console.error('Error updating date:', err)
      setDialogError('Failed to update date')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDate = async () => {
    if (!deleteItem?.item) return

    try {
      setLoading(true)
      await MarketDatesService.deleteMarketDate(deleteItem.item.id)
      await loadData()
      setIsDeleteDialogOpen(false)
      setDeleteItem(null)
    } catch (err) {
      console.error('Error deleting date:', err)
      setError('Failed to delete date')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (deleteItem?.type === 'market') {
      handleDeleteMarket()
    } else if (deleteItem?.type === 'date') {
      handleDeleteDate()
    }
  }

  const openDeleteDialog = (type: 'market' | 'date', item: Market | MarketDate) => {
    setDeleteItem({ type, item })
    setIsDeleteDialogOpen(true)
  }

  const startEditMarket = (market: Market) => {
    setEditingMarketId(market.id)
    setEditingMarket({
      name: market.name,
      location: market.location,
      url: market.url,
      active: market.active
    })
  }

  const startEditDate = (date: MarketDate) => {
    setEditingDateId(date.id)
    setEditingDate({
      market_id: date.market_id,
      date: date.date,
      start_time: date.start_time,
      end_time: date.end_time
    })
  }

  const cancelEdit = () => {
    setEditingMarketId(null)
    setEditingMarket({})
    setEditingDateId(null)
    setEditingDate({})
  }

  const addDateToNewMarket = () => {
    setNewMarket(prev => ({
      ...prev,
      dates: [...(prev.dates || []), { date: '', start_time: '', end_time: '' }]
    }))
  }

  const removeDateFromNewMarket = (index: number) => {
    setNewMarket(prev => ({
      ...prev,
      dates: prev.dates?.filter((_, i) => i !== index) || []
    }))
  }

  const updateDateInNewMarket = (index: number, field: string, value: string) => {
    setNewMarket(prev => ({
      ...prev,
      dates: prev.dates?.map((date, i) => 
        i === index ? { ...date, [field]: value } : date
      ) || []
    }))
  }

  const getMarketName = (marketId: string | undefined) => {
    if (!marketId) return 'Unknown Market'
    const market = markets.find(m => m.id === marketId)
    return market?.name || 'Unknown Market'
  }

  const getMarketLocation = (marketId: string) => {
    const market = markets.find(m => m.id === marketId)
    return market?.location || 'Unknown Location'
  }

  const getMarketDates = (marketId: string) => {
    return marketDates.filter(d => d.market_id === marketId)
  }

  const toggleMarketExpansion = (marketId: string) => {
    const newExpanded = new Set(expandedMarkets)
    if (newExpanded.has(marketId)) {
      newExpanded.delete(marketId)
    } else {
      newExpanded.add(marketId)
    }
    setExpandedMarkets(newExpanded)
  }

  if (loading && markets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange mx-auto mb-4"></div>
          <p className="text-gray-600">Loading markets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {/* Markets Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray">Markets</h2>
          <Button
            onClick={() => setIsAddMarketFormVisible(!isAddMarketFormVisible)}
            className="bg-orange hover:bg-orange-900 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Market
          </Button>
        </div>

        {/* Add Market Form */}
        {isAddMarketFormVisible && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Add New Market</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray mb-2 block">Name *</label>
                  <Input
                    value={newMarket.name || ''}
                    onChange={(e) => setNewMarket({ ...newMarket, name: e.target.value })}
                    placeholder="Market name"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray mb-2 block">Location *</label>
                  <Input
                    value={newMarket.location || ''}
                    onChange={(e) => setNewMarket({ ...newMarket, location: e.target.value })}
                    placeholder="Market location"
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray mb-2 block">Website URL</label>
                <Input
                  value={newMarket.url || ''}
                  onChange={(e) => setNewMarket({ ...newMarket, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newMarket.active ?? true}
                  onCheckedChange={(checked) => setNewMarket({ ...newMarket, active: checked })}
                  style={{ backgroundColor: (newMarket.active ?? true) ? 'var(--primary-color)' : '#d1d5db' }}
                  className="[&>span]:!bg-white"
                />
                <span className="text-sm font-medium text-gray-600">Active</span>
              </div>

              {/* Add Dates Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Market Dates (Optional)</h4>
                  <Button
                    onClick={addDateToNewMarket}
                    size="sm"
                    variant="outline"
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Date
                  </Button>
                </div>
                
                {newMarket.dates && newMarket.dates.length > 0 && (
                  <div className="space-y-3">
                    {newMarket.dates.map((date, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <Input
                            type="date"
                            value={date.date}
                            onChange={(e) => updateDateInNewMarket(index, 'date', e.target.value)}
                            placeholder="Date"
                          />
                          <Input
                            type="time"
                            value={date.start_time}
                            onChange={(e) => updateDateInNewMarket(index, 'start_time', e.target.value)}
                            placeholder="Start time"
                          />
                          <Input
                            type="time"
                            value={date.end_time}
                            onChange={(e) => updateDateInNewMarket(index, 'end_time', e.target.value)}
                            placeholder="End time"
                          />
                        </div>
                        <Button
                          onClick={() => removeDateFromNewMarket(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleAddMarket}
                  disabled={loading}
                  className="bg-orange hover:bg-orange-900 text-white"
                >
                  {loading ? 'Adding...' : 'Add Market'}
                </Button>
                <Button
                  onClick={() => {
                    setIsAddMarketFormVisible(false)
                    setNewMarket({
                      name: '',
                      location: '',
                      url: '',
                      active: true,
                      dates: []
                    })
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Markets List */}
        <div className="space-y-4">
          {markets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No markets found</h3>
                <p className="text-gray-500">Create your first market to get started</p>
              </CardContent>
            </Card>
          ) : (
            markets.map((market) => (
              <Card key={market.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg">
                        {editingMarketId === market.id ? (
                          <Input
                            value={editingMarket.name || ''}
                            onChange={(e) => setEditingMarket({ ...editingMarket, name: e.target.value })}
                            className="text-lg font-bold w-full"
                          />
                        ) : (
                          market.name
                        )}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 hidden sm:block" />
                          {editingMarketId === market.id ? (
                            <Input
                              value={editingMarket.location || ''}
                              onChange={(e) => setEditingMarket({ ...editingMarket, location: e.target.value })}
                              className="text-sm w-full max-w-md"
                            />
                          ) : (
                            <span className="break-words">{market.location}</span>
                          )}
                        </div>
                        {market.url && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            <a
                              href={market.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange hover:text-orange-900 flex items-center gap-1"
                            >
                              Website
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={market.active}
                          onCheckedChange={(checked) => handleToggleMarketActive(market.id, checked)}
                          disabled={editingMarketId === market.id}
                          style={{ backgroundColor: market.active ? 'var(--primary-color)' : '#d1d5db' }}
                          className="[&>span]:!bg-white"
                        />
                        <span className="text-sm font-medium text-gray-600">
                          {market.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end gap-2">
                        {editingMarketId === market.id ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={handleEditMarket}
                              disabled={loading}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={cancelEdit}
                              size="sm"
                              variant="outline"
                              className="text-xs sm:text-sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => startEditMarket(market)}
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs sm:text-sm"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => openDeleteDialog('market', market)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        <Button
                          onClick={() => toggleMarketExpansion(market.id)}
                          size="sm"
                          variant="outline"
                          className="text-orange-600 hover:text-orange-700 text-xs sm:text-sm"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">{expandedMarkets.has(market.id) ? 'Hide' : 'Show'} Dates ({getMarketDates(market.id).length})</span>
                          <span className="sm:hidden">Dates ({getMarketDates(market.id).length})</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Expandable Dates Section */}
                {expandedMarkets.has(market.id) && (
                  <div className="border-t bg-gray-50">
                    <div className="p-4">
                      {getMarketDates(market.id).length === 0 ? (
                        <div className="text-center py-6 text-gray-500">
                          <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No dates added yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {getMarketDates(market.id)
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((date) => (
                            <div key={date.id} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="w-4 h-4 text-gray-500" />
                                  <span className="font-medium">{new Date(date.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  <span>{date.start_time} - {date.end_time}</span>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  onClick={() => {
                                    setEditingDateId(date.id)
                                    setEditingDate({
                                      market_id: date.market_id,
                                      date: date.date,
                                      start_time: date.start_time,
                                      end_time: date.end_time
                                    })
                                  }}
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => openDeleteDialog('date', date)}
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-start mt-4">
                        <Button
                          onClick={() => {
                            setNewDate({
                              market_id: market.id,
                              date: '',
                              start_time: '',
                              end_time: ''
                            })
                            setIsAddDateFormVisible(true)
                          }}
                          size="sm"
                          className="bg-orange hover:bg-orange-900 text-white"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Date
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add Date Form Modal */}
      {isAddDateFormVisible && (
        <Dialog open={isAddDateFormVisible} onOpenChange={setIsAddDateFormVisible}>
          <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-md">
            <DialogHeader>
              <DialogTitle className="text-orange-800">
                {getMarketName(newDate.market_id)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {dialogError && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-600">{dialogError}</AlertDescription>
                </Alert>
              )}
              <div>
                <label className="text-sm font-bold text-gray mb-2 block">Date *</label>
                <Input
                  type="date"
                  value={newDate.date || ''}
                  onChange={(e) => setNewDate({ ...newDate, date: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray mb-2 block">Start Time *</label>
                  <Input
                    type="time"
                    value={newDate.start_time || ''}
                    onChange={(e) => setNewDate({ ...newDate, start_time: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray mb-2 block">End Time *</label>
                  <Input
                    type="time"
                    value={newDate.end_time || ''}
                    onChange={(e) => setNewDate({ ...newDate, end_time: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleAddDate}
                  disabled={loading}
                  className="bg-orange hover:bg-orange-900 text-white"
                >
                  {loading ? 'Adding...' : 'Add Date'}
                </Button>
                <Button
                  onClick={() => {
                    setIsAddDateFormVisible(false)
                    setNewDate({
                      market_id: '',
                      date: '',
                      start_time: '',
                      end_time: ''
                    })
                    setDialogError('')
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Date Form Modal */}
      {editingDateId && (
        <Dialog open={!!editingDateId} onOpenChange={() => setEditingDateId(null)}>
          <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-md">
            <DialogHeader>
              <DialogTitle className="text-orange-800">Edit Market Date</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {dialogError && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-600">{dialogError}</AlertDescription>
                </Alert>
              )}
              
              <div>
                <label className="text-sm font-bold text-gray mb-2 block">Market *</label>
                <Select
                  value={editingDate.market_id || ''}
                  onValueChange={(value) => setEditingDate({ ...editingDate, market_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a market" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    {markets.filter(m => m.active).map((market) => (
                      <SelectItem key={market.id} value={market.id}>
                        {market.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray mb-2 block">Date *</label>
                <Input
                  type="date"
                  value={editingDate.date || ''}
                  onChange={(e) => setEditingDate({ ...editingDate, date: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray mb-2 block">Start Time *</label>
                  <Input
                    type="time"
                    value={editingDate.start_time || ''}
                    onChange={(e) => setEditingDate({ ...editingDate, start_time: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray mb-2 block">End Time *</label>
                  <Input
                    type="time"
                    value={editingDate.end_time || ''}
                    onChange={(e) => setEditingDate({ ...editingDate, end_time: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleEditDate}
                  disabled={loading}
                  className="bg-orange hover:bg-orange-900 text-white"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => {
                    setEditingDateId(null)
                    setEditingDate({})
                    setDialogError('')
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-800">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete{' '}
              <strong>
                {deleteItem?.type === 'market' 
                  ? (deleteItem?.item as Market)?.name || 'Unknown Market'
                  : getMarketName((deleteItem?.item as MarketDate)?.market_id)
                }
              </strong>? 
              {deleteItem?.type === 'market' 
                ? ' This will also delete all associated market dates and cannot be undone.'
                : ' This action cannot be undone.'
              }
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                onClick={() => setIsDeleteDialogOpen(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}