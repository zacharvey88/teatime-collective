import { supabase } from './supabaseClient'
import { formatDateTime } from './utils'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_type: 'cake' | 'cookie' | 'other'
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  special_instructions?: string
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  customer: Customer
  order_date: string
  delivery_date: string
  delivery_time: string
  delivery_address: string
  special_instructions?: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_method?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export interface CreateOrderData {
  customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>
  delivery_date: string
  delivery_time: string
  delivery_address: string
  special_instructions?: string
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
        .eq('email', orderData.customer.email)
        .single()

      let customerId: string

      if (customerError && customerError.code === 'PGRST116') {
        // Customer doesn't exist, create new one
        const newCustomer = await supabase
          .from('customers')
          .insert(orderData.customer)
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
            name: orderData.customer.name,
            phone: orderData.customer.phone,
            address: orderData.customer.address,
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
          order_date: new Date().toISOString(),
          delivery_date: orderData.delivery_date,
          delivery_time: orderData.delivery_time,
          delivery_address: orderData.delivery_address,
          special_instructions: orderData.special_instructions,
          total_amount: orderData.items.reduce((sum, item) => sum + item.total_price, 0),
          status: 'pending',
          payment_status: 'pending'
        })
        .select('id')
        .single()

      if (orderRequest.error) throw orderRequest.error

      // Create order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          orderData.items.map(item => ({
            ...item,
            order_id: orderRequest.data.id
          }))
        )

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

  // Update payment status
  static async updatePaymentStatus(orderId: string, paymentStatus: Order['payment_status']): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ 
        payment_status: paymentStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)

    if (error) throw error
  }

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
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      orderDate: formatDateTime(order.order_date),
      deliveryDate: formatDateTime(order.delivery_date),
      deliveryTime: order.delivery_time,
      totalAmount: `£${order.total_amount.toFixed(2)}`,
      status: order.status.replace('_', ' ').toUpperCase(),
      paymentStatus: order.payment_status.toUpperCase(),
      itemCount: order.items.length
    }
  }
} 