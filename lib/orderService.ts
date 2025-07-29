import { supabase } from './supabaseClient'

export interface OrderRequest {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  request_date: string
  estimated_total: number
  status: 'new_request' | 'reviewed' | 'approved' | 'rejected' | 'completed' | 'archived'
  notes: string
  special_requirements: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  request_id: string
  cake_flavor_id?: string
  cake_size_id?: string
  item_name: string
  quantity: number
  estimated_unit_price: number
  estimated_total_price: number
  special_instructions?: string
  created_at: string
}

export interface CreateOrderRequestData {
  customer_name: string
  customer_email: string
  customer_phone: string
  notes: string
  special_requirements: string
  items: Array<{
    cake_flavor_id?: string
    cake_size_id?: string
    item_name: string
    quantity: number
    estimated_unit_price: number
    estimated_total_price: number
    special_instructions?: string
  }>
}

export class OrderService {
  // Create a new order request with items
  static async createOrderRequest(orderData: CreateOrderRequestData): Promise<OrderRequest> {
    try {
      // Calculate total estimated value
      const estimatedTotal = orderData.items.reduce(
        (sum, item) => sum + item.estimated_total_price,
        0
      )

      // Create the order request
      const { data: orderRequest, error: orderError } = await supabase
        .from('order_requests')
        .insert({
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          estimated_total: estimatedTotal,
          notes: orderData.notes,
          special_requirements: orderData.special_requirements,
          status: 'new_request'
        })
        .select()
        .single()

      if (orderError) {
        console.error('Error creating order request:', orderError)
        throw new Error('Failed to create order request')
      }

      // Create the order items
      const orderItems = orderData.items.map(item => ({
        request_id: orderRequest.id,
        cake_flavor_id: item.cake_flavor_id,
        cake_size_id: item.cake_size_id,
        item_name: item.item_name,
        quantity: item.quantity,
        estimated_unit_price: item.estimated_unit_price,
        estimated_total_price: item.estimated_total_price,
        special_instructions: item.special_instructions
      }))

      const { error: itemsError } = await supabase
        .from('request_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error creating order items:', itemsError)
        // If items fail, we should probably delete the order request
        await supabase
          .from('order_requests')
          .delete()
          .eq('id', orderRequest.id)
        throw new Error('Failed to create order items')
      }

      return orderRequest
    } catch (error) {
      console.error('Error in createOrderRequest:', error)
      throw error
    }
  }

  // Get all order requests (for admin)
  static async getOrderRequests(includeArchived: boolean = false): Promise<OrderRequest[]> {
    let query = supabase
      .from('order_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (!includeArchived) {
      query = query.neq('status', 'archived')
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching order requests:', error)
      throw new Error('Failed to fetch order requests')
    }

    return data || []
  }

  // Get order request by ID with items
  static async getOrderRequestById(id: string): Promise<OrderRequest & { items: OrderItem[] }> {
    const { data: orderRequest, error: orderError } = await supabase
      .from('order_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (orderError) {
      console.error('Error fetching order request:', orderError)
      throw new Error('Failed to fetch order request')
    }

    const { data: items, error: itemsError } = await supabase
      .from('request_items')
      .select('*')
      .eq('request_id', id)

    if (itemsError) {
      console.error('Error fetching order items:', itemsError)
      throw new Error('Failed to fetch order items')
    }

    return {
      ...orderRequest,
      items: items || []
    }
  }

  // Update order request status
  static async updateOrderStatus(id: string, status: OrderRequest['status']): Promise<void> {
    const { error } = await supabase
      .from('order_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error updating order status:', error)
      throw new Error('Failed to update order status')
    }
  }

  // Send email notification
  static async sendOrderNotification(orderRequest: OrderRequest): Promise<void> {
    try {
      await fetch('/api/send-order-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderRequest.id })
      })
    } catch (error) {
      console.error('Error sending order notification:', error)
      // Don't throw error - notification failure shouldn't break order submission
    }
  }
} 