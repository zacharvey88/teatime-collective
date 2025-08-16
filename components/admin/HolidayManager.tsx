'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  Calendar,
  CalendarDays
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { HolidayService, Holiday, CreateHolidayData } from '@/lib/holidayService'
import LoadingSpinner from '@/components/ui/loading-spinner'

export default function HolidayManager() {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteHoliday, setDeleteHoliday] = useState<Holiday | null>(null)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [newHoliday, setNewHoliday] = useState<CreateHolidayData>({
    name: '',
    start_date: '',
    end_date: '',
    description: ''
  })

  useEffect(() => {
    loadHolidays()
  }, [])

  const loadHolidays = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await HolidayService.getHolidays()
      setHolidays(data)
    } catch (err) {
      setError('Failed to load holidays')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateHoliday = async () => {
    try {
      if (!newHoliday.name.trim() || !newHoliday.start_date || !newHoliday.end_date) {
        setError('Please fill in all required fields')
        return
      }

      if (new Date(newHoliday.start_date) > new Date(newHoliday.end_date)) {
        setError('End date must be after start date')
        return
      }

      const createdHoliday = await HolidayService.createHoliday({
        name: newHoliday.name.trim(),
        start_date: newHoliday.start_date,
        end_date: newHoliday.end_date,
        description: newHoliday.description?.trim() || undefined
      })

      setNewHoliday({ name: '', start_date: '', end_date: '', description: '' })
      setIsCreateDialogOpen(false)
      setError('')
      setSuccess('Holiday created successfully')
      
      // Add the new holiday to the state directly instead of reloading
      if (createdHoliday) {
        setHolidays(prev => [...prev, createdHoliday])
      }
    } catch (err) {
      setError('Failed to create holiday')
      console.error(err)
    }
  }

  const handleEditHoliday = (holiday: Holiday) => {
    setEditingHoliday(holiday)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingHoliday) return

    try {
      if (!editingHoliday.name.trim() || !editingHoliday.start_date || !editingHoliday.end_date) {
        setError('Please fill in all required fields')
        return
      }

      if (new Date(editingHoliday.start_date) > new Date(editingHoliday.end_date)) {
        setError('End date must be after start date')
        return
      }

      const updatedHoliday = await HolidayService.updateHoliday(editingHoliday.id, {
        name: editingHoliday.name.trim(),
        start_date: editingHoliday.start_date,
        end_date: editingHoliday.end_date,
        description: editingHoliday.description?.trim() || undefined
      })

      setIsEditDialogOpen(false)
      setEditingHoliday(null)
      setError('')
      setSuccess('Holiday updated successfully')
      
      // Update the holiday in the state directly instead of reloading
      setHolidays(prev => prev.map(holiday => 
        holiday.id === updatedHoliday.id ? updatedHoliday : holiday
      ))
    } catch (err) {
      setError('Failed to update holiday')
      console.error(err)
    }
  }

  const handleDeleteHoliday = (holiday: Holiday) => {
    setDeleteHoliday(holiday)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteHoliday) return

    try {
      await HolidayService.deleteHoliday(deleteHoliday.id)
      setError('')
      setSuccess('Holiday deleted successfully')
      setIsDeleteDialogOpen(false)
      
      // Remove the holiday from the state directly instead of reloading
      setHolidays(prev => prev.filter(holiday => holiday.id !== deleteHoliday.id))
      setDeleteHoliday(null)
    } catch (err) {
      setError('Failed to delete holiday')
      console.error(err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays === 1 ? '1 day' : `${diffDays} days`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Holiday Management</h2>
          <p className="text-gray-600 mt-1">Manage blocked dates for cake orders</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange hover:bg-orange/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Holiday
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-gray-200 shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-orange">Add Holiday</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Name *
                </label>
                <Input
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  placeholder="e.g., Christmas Break, Summer Holiday"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={newHoliday.start_date}
                    onChange={(e) => setNewHoliday({ ...newHoliday, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    value={newHoliday.end_date}
                    onChange={(e) => setNewHoliday({ ...newHoliday, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <Input
                  value={newHoliday.description}
                  onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                  placeholder="Additional details about this holiday period"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false)
                  setNewHoliday({ name: '', start_date: '', end_date: '', description: '' })
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateHoliday}
                className="bg-orange hover:bg-orange/90 text-white"
              >
                Add Holiday
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <LoadingSpinner message="Loading holidays..." />
      )}

      {/* Holidays List */}
      {!loading && (
        <div className="space-y-4">
          {holidays.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No holidays configured yet</p>
            </div>
          ) : (
            holidays.map((holiday) => (
              <div key={holiday.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Calendar className="w-5 h-5 text-orange" />
                      <h3 className="text-lg font-semibold text-gray-800">{holiday.name}</h3>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{formatDate(holiday.start_date)}</span>
                      <span className="mx-2">to</span>
                      <span className="font-medium">{formatDate(holiday.end_date)}</span>
                      <span className="ml-2 text-gray-500">({getDateRange(holiday.start_date, holiday.end_date)})</span>
                    </div>
                    {holiday.description && (
                      <p className="text-sm text-gray-600">{holiday.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditHoliday(holiday)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteHoliday(holiday)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-orange">Edit Holiday</DialogTitle>
          </DialogHeader>
          {editingHoliday && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday Name *
                </label>
                <Input
                  value={editingHoliday.name}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, name: e.target.value })}
                  placeholder="e.g., Christmas Break, Summer Holiday"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={editingHoliday.start_date}
                    onChange={(e) => setEditingHoliday({ ...editingHoliday, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <Input
                    type="date"
                    value={editingHoliday.end_date}
                    onChange={(e) => setEditingHoliday({ ...editingHoliday, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <Input
                  value={editingHoliday.description || ''}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, description: e.target.value })}
                  placeholder="Additional details about this holiday period"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setEditingHoliday(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-orange hover:bg-orange/90 text-white"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              {deleteHoliday && (
                <>
                  <p className="mb-2">
                    Are you sure you want to delete this holiday?
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="font-medium text-red-800">
                      "{deleteHoliday.name}"
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      {formatDate(deleteHoliday.start_date)} - {formatDate(deleteHoliday.end_date)}
                    </p>
                    {deleteHoliday.description && (
                      <p className="text-sm text-red-600 mt-1">
                        {deleteHoliday.description}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteDialogOpen(false)
                  setDeleteHoliday(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Holiday
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 