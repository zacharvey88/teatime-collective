'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Calendar,
  Mail,
  Phone,
  Package,
  PoundSterling,
  Search,
  X,
  ChevronDown,
  User,
  FileText,
  Star,
  Settings,
  AlertCircle,
  Archive,
  Type
} from 'lucide-react'
import { OrderService, Order } from '@/lib/orderService'
import { supabase } from '@/lib/supabaseClient'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface OrderWithItems extends Order {
  items: Array<{
    id: string
    order_id: string
    cake_id?: string
    cake_size_id?: string
    item_name: string
    quantity: number
    estimated_unit_price: number
    estimated_total_price: number
    writing_on_cake?: string
    custom_cake_description?: string
    is_custom_cake?: boolean
    custom_cake_size?: string
    created_at: string
  }>
}

interface OrderItemProps {
  order: Order
  isExpanded: boolean
  onToggle: () => void
  onUpdateStatus: (orderId: string, status: Order['status']) => void
  updating: boolean
}

// Helper functions
const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'new_request':
      return 'bg-blue-100 text-blue-800'
    case 'reviewed':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    case 'completed':
      return 'bg-gray-100 text-gray-800'
    case 'archived':
      return 'bg-slate-100 text-slate-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'new_request':
      return <Clock className="w-4 h-4" />
    case 'reviewed':
      return <Eye className="w-4 h-4" />
    case 'approved':
      return <CheckCircle className="w-4 h-4" />
    case 'rejected':
      return <XCircle className="w-4 h-4" />
    case 'completed':
      return <CheckCircle className="w-4 h-4" />
    case 'archived':
      return <Archive className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

function OrderItem({ order, isExpanded, onToggle, onUpdateStatus, updating }: OrderItemProps) {
  const [orderDetails, setOrderDetails] = useState<OrderWithItems | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [detailedItems, setDetailedItems] = useState<Array<{
    id: string
    name: string
    size: string
    quantity: number
    price: number
    totalPrice: number
    writingOnCake?: string
    details?: string
  }>>([])

  const getDetailedCakeInfo = async (item: any) => {
    let sizeName = item.custom_cake_size || 'Standard'
    let cakeName = item.item_name
    
    // If it's not a custom cake, get the actual size and variant info
    if (!item.is_custom_cake && item.cake_id && item.cake_size_id) {
      try {
        // Get cake details with category name
        const { data: cake } = await supabase
          .from('cakes')
          .select(`
            name,
            category_id,
            cake_categories!inner(name)
          `)
          .eq('id', item.cake_id)
          .single()
        
        // Get size details
        const { data: cakeSize } = await supabase
          .from('cake_sizes')
          .select('name')
          .eq('id', item.cake_size_id)
          .single()
        
        if (cake && cakeSize) {
          // Append category name to cake name if it exists
          const categoryName = Array.isArray(cake.cake_categories) 
            ? cake.cake_categories[0]?.name 
            : cake.cake_categories?.name
          cakeName = categoryName ? `${cake.name} - ${categoryName}` : cake.name
          sizeName = cakeSize.name
        }
      } catch (error) {
        console.error('Error fetching cake details:', error)
        // Fall back to original values
      }
    }
    
    return {
      id: item.id,
      name: cakeName,
      size: sizeName,
      quantity: item.quantity,
      price: item.estimated_unit_price,
      totalPrice: item.estimated_total_price,
      writingOnCake: item.writing_on_cake || '',
      details: item.custom_cake_description || undefined
    }
  }

  const loadOrderDetails = async () => {
    if (!orderDetails && isExpanded) {
      try {
        setLoadingDetails(true)
        const details = await OrderService.getOrderById(order.id)
        if (details) {
          // Transform the data to match OrderWithItems interface
          const transformedDetails: OrderWithItems = {
            ...details,
            items: details.items.map(item => ({
              ...item,
              cake_id: item.cake_id || undefined,
              cake_size_id: item.cake_size_id || undefined,
              writing_on_cake: item.writing_on_cake || undefined
            }))
          }
          setOrderDetails(transformedDetails)
          
          // Get detailed cake information for each item
          const detailedItemsData = await Promise.all(
            details.items.map(item => getDetailedCakeInfo(item))
          )
          setDetailedItems(detailedItemsData)
        }
      } catch (error) {
        console.error('Failed to load order details:', error)
      } finally {
        setLoadingDetails(false)
      }
    }
  }

  useEffect(() => {
    if (isExpanded) {
      loadOrderDetails()
    }
  }, [isExpanded])

  return (
    <div className="mb-3 sm:mb-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Order Header - Always Visible */}
      <div 
        className="p-4 sm:p-6 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Mobile/Tablet Layout (stacked) */}
            <div className="lg:hidden">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{order.customer_name}</h3>
                  <p className="text-sm text-gray-500">{order.customer_email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-4 h-4 text-orange-500" />
                  <span>{order.customer_phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>{new Date(order.created_at).toLocaleDateString('en-GB')} </span>
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>{new Date(order.created_at).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-green-700 text-lg">£{order.estimated_total.toFixed(2)}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(order.status)} shadow-sm`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status.replace('_', ' ')}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Layout (single row) */}
            <div className="hidden lg:grid lg:grid-cols-5 lg:gap-6 lg:items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{order.customer_name}</h3>
                  <p className="text-sm text-gray-500">{order.customer_email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="w-4 h-4 text-orange-500" />
                <span>{order.customer_phone}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>{new Date(order.created_at).toLocaleDateString('en-GB')} </span>
                <Clock className="w-4 h-4 text-orange-500" />
                <span>{new Date(order.created_at).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}</span>
              </div>
              
              <div className="flex items-center justify-end">
                <span className="font-bold text-green-700 text-lg">£{order.estimated_total.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-end">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(order.status)} shadow-sm`}>
                  {getStatusIcon(order.status)}
                  <span className="capitalize">{order.status.replace('_', ' ')}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <ChevronDown 
              className={`w-6 h-6 text-orange-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="bg-gradient-to-br from-gray-50 to-orange-50">
          {loadingDetails ? (
            <LoadingSpinner message="Loading order details..." />
          ) : orderDetails ? (
            <div className="p-4 sm:p-6 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  <span>Order Items</span>
                </h4>
                <div className="space-y-3">
                  {detailedItems.length > 0 ? detailedItems.map((item, index) => (
                    <div key={item.id} className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{item.name}</div>
                            <div className="text-sm text-gray-600 flex items-center space-x-4">
                              <span>Size: {item.size}</span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                            {item.details && (
                              <div className="text-sm text-gray-500 mt-1 italic">{item.details}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-700">£{item.totalPrice.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">£{item.price.toFixed(2)} each</div>
                        </div>
                      </div>
                      
                      {/* Writing on Cake - Show if exists */}
                      {item.writingOnCake && (
                        <div className="mt-3 pt-3 border-t border-orange-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Type className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Writing on Cake:</span>
                          </div>
                          <p className="text-sm text-gray-700 bg-green-50 p-2 rounded break-words">{item.writingOnCake}</p>
                        </div>
                      )}
                    </div>
                  )) : orderDetails.items.map((item, index) => (
                    <div key={item.id} className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{item.item_name}</div>
                            <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-700">£{item.estimated_total_price.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">£{item.estimated_unit_price.toFixed(2)} each</div>
                        </div>
                      </div>
                      
                      {/* Writing on Cake - Show if exists */}
                      {item.writing_on_cake && (
                        <div className="mt-3 pt-3 border-t border-orange-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Type className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Writing on Cake:</span>
                          </div>
                          <p className="text-sm text-gray-700 bg-green-50 p-2 rounded break-words">{item.writing_on_cake}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Total */}
                                 <div className="mt-4 pt-4 border-t border-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-700">£{orderDetails.estimated_total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Allergies */}
                {orderDetails.allergies && (
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span>Allergies</span>
                    </h4>
                    <p className="text-gray-700 bg-red-50 p-3 rounded-lg shadow-sm break-words">{orderDetails.allergies}</p>
                  </div>
                )}



                {/* Special Requests */}
                {orderDetails.special_requests && (
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center space-x-2">
                      <Star className="w-5 h-5 text-purple-500" />
                      <span>Special Requests</span>
                    </h4>
                    <p className="text-gray-700 bg-purple-50 p-3 rounded-lg shadow-sm break-words">{orderDetails.special_requests}</p>
                  </div>
                )}
              </div>

              {/* Notes - Separate row since it might be longer */}
              {orderDetails.notes && (
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span>Customer Notes</span>
                  </h4>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-lg shadow-sm">{orderDetails.notes}</p>
                </div>
              )}

                             {/* Status Update */}
               <div className="bg-white rounded-lg p-4 shadow-md">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  <span>Update Order Status</span>
                </h4>
                                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                   {['new_request', 'reviewed', 'approved', 'rejected', 'completed', 'archived'].map((status) => (
                    <Button
                      key={status}
                      variant={orderDetails.status === status ? "default" : "outline"}
                      size="sm"
                      className={`justify-start transition-all duration-200 ${
                        orderDetails.status === status 
                          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                          : 'hover:bg-orange-50 hover:border-orange-300'
                      }`}
                      onClick={() => onUpdateStatus(orderDetails.id, status as Order['status'])}
                      disabled={updating}
                    >
                      {getStatusIcon(status as Order['status'])}
                      <span className="ml-2 capitalize">{status.replace('_', ' ')}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Failed to load order details</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface OrderManagerProps {
  initialStatusFilter?: string | null
}

export default function OrderManager({ initialStatusFilter }: OrderManagerProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Set<Order['status']>>(
    initialStatusFilter ? new Set([initialStatusFilter as Order['status']]) : new Set()
  )
  const [statusFilterOpen, setStatusFilterOpen] = useState(false)
  const [includeArchived, setIncludeArchived] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusFilterOpen && !(event.target as Element).closest('.status-filter-dropdown')) {
        setStatusFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [statusFilterOpen])

  useEffect(() => {
    loadOrders()
  }, [includeArchived])

  // Filter orders based on search term and status
  useEffect(() => {
    let filtered = orders

    // Filter by status
    if (statusFilter.size > 0) {
      filtered = filtered.filter(order => statusFilter.has(order.status))
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(term) ||
        order.customer_email.toLowerCase().includes(term) ||
        order.customer_phone.includes(term) ||
        order.id.toLowerCase().includes(term) ||
        order.estimated_total.toString().includes(term)
      )
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await OrderService.getAllOrders(includeArchived)
      setOrders(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleOrder = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null)
    } else {
      setExpandedOrderId(orderId)
    }
  }

  const handleUpdateStatus = async (orderId: string, status: Order['status']) => {
    try {
      setUpdating(true)
      await OrderService.updateOrderStatus(orderId, status)
      await loadOrders() // Reload orders to get updated status
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray mb-2">Order Management</h1>
          <p className="text-gray-600">View and manage customer order requests</p>
        </div>
        <LoadingSpinner message="Loading orders..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray mb-2">Order Management</h1>
        <p className="text-gray-600">View and manage customer order requests</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <div className="border-b border-gray-100 pb-4 sm:pb-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Orders ({filteredOrders.length})
            </h2>
            
                        {/* Search and Filter Controls */}
            <div className="flex flex-col gap-3">
              {/* Row 1 - Search and Desktop Controls (Mobile: full width, Tablet: side by side, Desktop: all in one row) */}
              <div className="flex flex-col sm:flex-row lg:flex-row gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-8 w-full sm:w-64 lg:w-64"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Desktop Status Filter (Desktop only) */}
                <div className="hidden lg:block">
                  <div className="relative status-filter-dropdown">
                    <button
                      onClick={() => setStatusFilterOpen(!statusFilterOpen)}
                      className="px-3 py-2 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent bg-white w-48 text-left flex items-center justify-between"
                    >
                      <span className="truncate">
                        {statusFilter.size === 0 
                          ? 'All Status' 
                          : `${statusFilter.size} selected`
                        }
                      </span>
                      <ChevronDown className="text-gray-400 w-4 h-4 ml-6 flex-shrink-0" />
                    </button>
                    
                    {statusFilterOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {[
                          { value: 'new_request', label: 'New Request' },
                          { value: 'reviewed', label: 'Reviewed' },
                          { value: 'approved', label: 'Approved' },
                          { value: 'rejected', label: 'Rejected' },
                          { value: 'completed', label: 'Completed' },
                          { value: 'archived', label: 'Archived' }
                        ].map((status) => (
                          <label
                            key={status.value}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={statusFilter.has(status.value as Order['status'])}
                              onChange={(e) => {
                                const newFilter = new Set(statusFilter)
                                if (e.target.checked) {
                                  newFilter.add(status.value as Order['status'])
                                } else {
                                  newFilter.delete(status.value as Order['status'])
                                }
                                setStatusFilter(newFilter)
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm">{status.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Action Buttons (Desktop only) */}
                <div className="hidden lg:flex gap-3">
                  {/* Clear Filters Button */}
                  {(searchTerm || statusFilter.size > 0) && (
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter(new Set())
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      Clear Filters
                    </button>
                  )}

                  {/* Include Archived Toggle */}
                  <button
                    onClick={() => setIncludeArchived(!includeArchived)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      includeArchived 
                        ? 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <Archive className="w-4 h-4" />
                    <span>{includeArchived ? 'Hide Archived' : 'Show Archived'}</span>
                  </button>
                </div>
              </div>

              {/* Row 2 - Status Filter and Action Buttons (Mobile: stacked, Tablet: side by side, Desktop: hidden) */}
              <div className="flex flex-col sm:flex-row lg:hidden gap-3">
                {/* Status Filter */}
                <div className="relative status-filter-dropdown">
                  <button
                    onClick={() => setStatusFilterOpen(!statusFilterOpen)}
                    className="px-3 py-2 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent bg-white w-full sm:w-48 text-left flex items-center justify-between"
                  >
                    <span className="truncate">
                      {statusFilter.size === 0 
                        ? 'All Status' 
                        : `${statusFilter.size} selected`
                      }
                    </span>
                    <ChevronDown className="text-gray-400 w-4 h-4 ml-6 flex-shrink-0" />
                  </button>
                  
                  {statusFilterOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {[
                        { value: 'new_request', label: 'New Request' },
                        { value: 'reviewed', label: 'Reviewed' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'rejected', label: 'Rejected' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'archived', label: 'Archived' }
                      ].map((status) => (
                        <label
                          key={status.value}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                                                          checked={statusFilter.has(status.value as Order['status'])}
                              onChange={(e) => {
                                const newFilter = new Set(statusFilter)
                                if (e.target.checked) {
                                  newFilter.add(status.value as Order['status'])
                                } else {
                                  newFilter.delete(status.value as Order['status'])
                                }
                              setStatusFilter(newFilter)
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{status.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tablet/Mobile Action Buttons */}
                <div className="flex gap-3">
                  {/* Clear Filters Button */}
                  {(searchTerm || statusFilter.size > 0) && (
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter(new Set())
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap flex-1 sm:flex-none"
                    >
                      Clear Filters
                    </button>
                  )}

                  {/* Include Archived Toggle */}
                  <button
                    onClick={() => setIncludeArchived(!includeArchived)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${
                      includeArchived 
                        ? 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <Archive className="w-4 h-4" />
                    <span>{includeArchived ? 'Hide Archived' : 'Show Archived'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {orders.length === 0 ? 'No orders found' : 'No orders match your search criteria'}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderItem 
                key={order.id} 
                order={order} 
                isExpanded={expandedOrderId === order.id}
                onToggle={() => handleToggleOrder(order.id)}
                onUpdateStatus={handleUpdateStatus}
                updating={updating}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
} 