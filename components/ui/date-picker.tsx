'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from './button'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  blockedDates?: string[]
  minDate?: string
  placeholder?: string
  className?: string
}

export function DatePicker({ 
  value, 
  onChange, 
  blockedDates = [], 
  minDate,
  placeholder = "Select date",
  className = ""
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update selected date when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value))
    } else {
      setSelectedDate(null)
    }
  }, [value])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const isDateBlocked = (date: Date) => {
    const dateStr = formatDate(date)
    return blockedDates.includes(dateStr)
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (minDate) {
      const minDateObj = new Date(minDate)
      return date < minDateObj || date < today
    }
    
    return date < today
  }

  const handleDateSelect = (date: Date) => {
    if (isDateBlocked(date) || isDateDisabled(date)) return
    
    setSelectedDate(date)
    onChange(formatDate(date))
    setIsOpen(false)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  const renderCalendarDays = () => {
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isBlocked = isDateBlocked(date)
      const isDisabled = isDateDisabled(date)
      const isSelected = selectedDate && formatDate(selectedDate) === formatDate(date)
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          disabled={isBlocked || isDisabled}
          className={`
            h-10 w-10 rounded-lg text-sm font-medium transition-all
            ${isSelected 
              ? 'bg-orange text-white' 
              : isBlocked 
                ? 'bg-red-100 text-red-600 cursor-not-allowed hover:bg-red-200' 
                : isDisabled 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-100'
            }
          `}
          title={isBlocked ? 'Date unavailable due to holiday' : ''}
        >
          {day}
        </button>
      )
    }
    
    return days
  }

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal"
      >
        <Calendar className="mr-2 h-4 w-4" />
        {selectedDate ? (
          selectedDate.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          })
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
            <div className="flex space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
            {renderCalendarDays()}
          </div>
          
          {/* Legend */}
          {blockedDates.length > 0 && (
            <div className="flex items-center space-x-4 text-xs text-gray-600 border-t pt-3">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-100 rounded"></div>
                <span>Unavailable</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-orange rounded"></div>
                <span>Selected</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 