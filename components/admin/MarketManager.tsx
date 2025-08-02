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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

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

  const handleAddMarket = async () => {
    if (!newMarket.name || !newMarket.date || !newMarket.start_time || !newMarket.end_time || !newMarket.location || !newMarket.url) {
      setError('Please fill in all required fields')
      return
    }

    try {
      const marketData: CreateMarketDateData = {
        name: newMarket.name,
        date: newMarket.date,
        start_time: newMarket.start_time,
        end_time: newMarket.end_time,
        location: newMarket.location,
        url: newMarket.url,
        active: newMarket.active
      }

      await MarketDatesService.createMarketDate(marketData)
      await loadMarketDates()
      setNewMarket({ name: '', date: '', start_time: '', end_time: '', location: '', url: '', active: true })
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to add market date')
    }
  }

  const handleDeleteMarket = async (id: string) => {
    try {
      await MarketDatesService.deleteMarketDate(id)
      await loadMarketDates()
    } catch (err: any) {
      setError(err.message || 'Failed to delete market date')
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
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to update market date')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingMarket({})
  }

  const handleToggleActive = async (id: string) => {
    try {
      const market = marketDates.find(m => m.id === id)
      if (market) {
        await MarketDatesService.toggleActive(id, !market.active)
        await loadMarketDates()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle market status')
    }
  }

  const sortedMarkets = [...marketDates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray mb-2">Market Dates</h1>
        <p className="text-gray-600">Manage your market appearances and events</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add New Market */}
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
          <div className="flex items-center gap-4 mt-4">
            <Button 
              onClick={handleAddMarket}
              className="bg-orange hover:bg-orange-900 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Market
            </Button>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newMarket.active}
                onChange={(e) => setNewMarket({ ...newMarket, active: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Active</span>
            </label>
          </div>
        </CardContent>
      </Card>

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
                        onClick={() => handleDeleteMarket(market.id)}
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
    </div>
  )
} 