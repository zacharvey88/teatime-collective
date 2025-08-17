import { supabase } from './supabaseClient'
import { formatDateTime } from './utils'

export interface Customer {
  id: string
  email: string
  name: string
  phone: string
  address: string
  first_request_date: string
  last_request_date: string
  total_requests: number
  total_estimated_value: number
  favorite_flavor: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  cake_flavor_id?: string
  cake_size_id?: string
  item_name: string
  quantity: number
  estimated_unit_price: number
  estimated_total_price: number
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  collection_date: string
  estimated_total: number
  status: 'new_request' | 'reviewed' | 'approved' | 'rejected' | 'completed' | 'archived'
  email_sent: boolean
  notes?: string
  created_at: string
  updated_at: string
  allergies?: string
  writing_on_cake?: string
  special_requests?: string
  items: OrderItem[]
}

export interface CreateOrderData {
  customer_name: string
  customer_email: string
  customer_phone: string
  collection_date: string
  estimated_total: number
  allergies?: string
  writing_on_cake?: string
  special_requests?: string
  notes?: string
  items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]
}

export class OrderService {
  // Get all orders with customer and item details
  static async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        items:order_items(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get order by ID with full details
  static async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        items:order_items(*)
      `)
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  // Create a new order with customer and items
  static async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      // Start a transaction
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', orderData.customer_email)
        .single()

      let customerId: string

      if (customerError && customerError.code === 'PGRST116') {
        // Customer doesn't exist, create new one
        const newCustomer = await supabase
          .from('customers')
          .insert({
            email: orderData.customer_email,
            name: orderData.customer_name,
            phone: orderData.customer_phone,
            address: 'Address not provided' // Placeholder, needs actual address field
          })
          .select('id')
          .single()

        if (newCustomer.error) throw newCustomer.error
        customerId = newCustomer.data.id
      } else if (customerError) {
        throw customerError
      } else {
        // Customer exists, update their information
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            name: orderData.customer_name,
            phone: orderData.customer_phone,
            address: 'Address not provided', // Placeholder, needs actual address field
            updated_at: new Date().toISOString()
          })
          .eq('id', customer.id)

        if (updateError) throw updateError
        customerId = customer.id
      }

      // Create the order
      const orderRequest = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          collection_date: orderData.collection_date,
          estimated_total: orderData.estimated_total,
          status: 'new_request',
          email_sent: false,
          notes: orderData.notes || '',
          allergies: orderData.allergies || '',
          writing_on_cake: orderData.writing_on_cake || '',
          special_requests: orderData.special_requests || '',
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (orderRequest.error) throw orderRequest.error

      // Create order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderData.items.map(item => ({
          order_id: orderRequest.data.id,
          item_name: item.item_name,
          quantity: item.quantity,
          estimated_unit_price: item.estimated_unit_price,
          estimated_total_price: item.estimated_total_price,
          created_at: new Date().toISOString()
        })))

      if (itemsError) {
        // If items creation fails, delete the order
        await supabase
          .from('orders')
          .delete()
          .eq('id', orderRequest.data.id)
        throw itemsError
      }

      // Return the complete order
      return await this.getOrderById(orderRequest.data.id) as Order
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  // Compatibility method for old order request format
  static async createOrderRequest(oldOrderData: any): Promise<Order> {
    // Convert old format to new format
    const newOrderData: CreateOrderData = {
      customer_name: oldOrderData.customer_name,
      customer_email: oldOrderData.customer_email,
      customer_phone: oldOrderData.customer_phone,
      collection_date: oldOrderData.request_date,
      estimated_total: oldOrderData.estimated_total,
      allergies: oldOrderData.allergies || '',
      writing_on_cake: oldOrderData.writing_on_cake || '',
      special_requests: oldOrderData.special_requests || '',
      notes: oldOrderData.notes || '',
      items: oldOrderData.items.map((item: any) => ({
        item_name: item.item_name,
        quantity: item.quantity,
        estimated_unit_price: item.estimated_unit_price,
        estimated_total_price: item.estimated_total_price
      }))
    }

    return this.createOrder(newOrderData)
  }

  // Send order notification (placeholder for compatibility)
  static async sendOrderNotification(order: Order): Promise<void> {
    // This method is kept for compatibility but doesn't do anything
    // The actual notification is handled by the API route
    console.log('Order notification placeholder called for order:', order.id)
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)

    if (error) throw error
  }

  // Update payment status - removed as payment_status field no longer exists in Order interface

  // Get orders by status
  static async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        items:order_items(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get orders by date range
  static async getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        items:order_items(*)
      `)
      .gte('delivery_date', startDate)
      .lte('delivery_date', endDate)
      .order('delivery_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Get orders for a specific customer
  static async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        items:order_items(*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Delete an order (and its items)
  static async deleteOrder(orderId: string): Promise<void> {
    // Delete order items first
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId)

    if (itemsError) throw itemsError

    // Delete the order
    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (orderError) throw orderError
  }

  // Get order statistics
  static async getOrderStats(): Promise<{
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    ordersByStatus: Record<Order['status'], number>
  }> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_amount, status')

    if (error) throw error

    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    const ordersByStatus = orders.reduce((acc, order) => {
      const status = order.status as Order['status']
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<Order['status'], number>)

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus
    }
  }

  // Format order for display
  static formatOrderForDisplay(order: Order): {
    id: string
    customerName: string
    customerEmail: string
    orderDate: string
    deliveryDate: string
    deliveryTime: string
    totalAmount: string
    status: string
    paymentStatus: string
    itemCount: number
  } {
    return {
      id: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      orderDate: formatDateTime(order.created_at),
      deliveryDate: formatDateTime(order.collection_date),
      deliveryTime: '12:00', // Default time since old format didn't have it
      totalAmount: `£${order.estimated_total.toFixed(2)}`,
      status: order.status.replace('_', ' ').toUpperCase(),
      paymentStatus: 'PENDING', // No payment_status field in new Order interface
      itemCount: order.items.length
    }
  }
} 