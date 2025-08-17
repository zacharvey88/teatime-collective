import { supabase } from './supabaseClient'

export interface OrderStats {
  totalOrders: number
  totalEstimatedValue: number
  averageOrderValue: number
  recentOrders: number
  newOrders: number
}

export interface CustomerInsights {
  totalCustomers: number
  repeatCustomers: number
  averageCustomerValue: number
  topCustomers: Array<{
    name: string
    email: string
    totalOrders: number
    totalEstimatedValue: number
  }>
}

export interface CakeAnalytics {
  topFlavors: Array<{
    name: string
    orderCount: number
    revenue: number
  }>
  popularFlavors: Array<{
    name: string
    customerCount: number
  }>
}

export interface RecentActivity {
  id: string
  type: 'order' | 'customer' | 'payment'
  title: string
  description: string
  timestamp: string
  amount?: number
}

export class OrderAnalyticsService {
  // Get overall order statistics
  static async getOrderStats(): Promise<OrderStats> {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get total requests and estimated value
    const { data: totalData, error: totalError } = await supabase
      .from('orders')
      .select('estimated_total')

    if (totalError) throw new Error('Failed to fetch order stats')

    const totalOrders = totalData?.length || 0
    const totalEstimatedValue = totalData?.reduce((sum, order) => sum + parseFloat(order.estimated_total), 0) || 0
    const averageOrderValue = totalOrders > 0 ? totalEstimatedValue / totalOrders : 0

    // Get recent orders (last 7 days)
    const { data: recentData, error: recentError } = await supabase
      .from('orders')
      .select('id')
      .gte('collection_date', weekAgo.toISOString())

    if (recentError) throw new Error('Failed to fetch recent orders')

    const recentOrders = recentData?.length || 0

    // Get new orders
    const { data: newData, error: newError } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'new_request')

    if (newError) throw new Error('Failed to fetch new orders')

    const newOrders = newData?.length || 0

    return {
      totalOrders,
      totalEstimatedValue,
      averageOrderValue,
      recentOrders,
      newOrders
    }
  }

  // Get customer insights
  static async getCustomerInsights(): Promise<CustomerInsights> {
    // Get total customers from customers table
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .order('total_value', { ascending: false })

    if (customersError) throw new Error('Failed to fetch customers')

    const totalCustomers = customers?.length || 0
    const repeatCustomers = customers?.filter(c => c.total_orders > 1).length || 0
    const averageCustomerValue = totalCustomers > 0 
      ? customers?.reduce((sum, c) => sum + parseFloat(c.total_value), 0) / totalCustomers || 0
      : 0

    const topCustomers = customers?.slice(0, 5).map(c => ({
      name: c.name,
      email: c.email,
              totalOrders: c.total_orders,
      totalEstimatedValue: parseFloat(c.total_value)
    })) || []

    return {
      totalCustomers,
      repeatCustomers,
      averageCustomerValue,
      topCustomers
    }
  }

  // Get cake analytics (both categorized and standalone)
  static async getFlavorAnalytics(): Promise<CakeAnalytics> {
    try {
      // Get all order items to analyze cake popularity
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('item_name, estimated_total_price, cake_id')

      if (orderItemsError) {
        console.warn('Cake analytics error:', orderItemsError)
        // Return empty data if there's an error or no data
        return {
          topFlavors: [],
          popularFlavors: []
        }
      }

      // If no order data, return empty arrays
      if (!orderItems || orderItems.length === 0) {
        return {
          topFlavors: [],
          popularFlavors: []
        }
      }

      // Group by cake name - we'll look up all cake names from the cakes table
      const cakeStats = new Map()
      
      // Get unique cake IDs to fetch their names from the cakes table
      const cakeIds = Array.from(new Set(orderItems.map((item: any) => item.cake_id).filter(Boolean)))
      
      // Fetch cake names if we have cake IDs
      let cakeNames: { [key: string]: string } = {}
      if (cakeIds.length > 0) {
        const { data: cakes, error: cakesError } = await supabase
          .from('cakes')
          .select('id, name')
          .in('id', cakeIds)
        
        if (!cakesError && cakes) {
          cakes.forEach((cake: any) => {
            cakeNames[cake.id] = cake.name
          })
        }
      }
      
      orderItems.forEach((item: any) => {
        // Use cake name from the cakes table, fallback to item_name if no cake_id
        const cakeName = item.cake_id ? cakeNames[item.cake_id] || 'Unknown Cake' : item.item_name || 'Unknown Cake'
        if (!cakeStats.has(cakeName)) {
          cakeStats.set(cakeName, { orderCount: 0, revenue: 0 })
        }
        const stats = cakeStats.get(cakeName)
        stats.orderCount++
        stats.revenue += parseFloat(item.estimated_total_price || 0)
      })

    const topFlavors = Array.from(cakeStats.entries())
      .map(([name, stats]: [string, any]) => ({
        name,
        orderCount: stats.orderCount,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5)

    // Get popular flavors by unique customers
    const { data: customerFlavorData, error: customerFlavorError } = await supabase
      .from('customers')
      .select('favourite_cake')
      .not('favourite_cake', 'is', null)

      if (customerFlavorError) {
        console.warn('Customer flavor analytics error:', customerFlavorError)
      }

    const flavorCustomerCount = new Map()
    customerFlavorData?.forEach(customer => {
      const flavor = customer.favourite_cake
        if (flavor) {
      flavorCustomerCount.set(flavor, (flavorCustomerCount.get(flavor) || 0) + 1)
        }
    })

    const popularFlavors = Array.from(flavorCustomerCount.entries())
      .map(([name, count]) => ({
        name,
        customerCount: count
      }))
      .sort((a, b) => b.customerCount - a.customerCount)
      .slice(0, 5)

    return {
      topFlavors,
      popularFlavors
      }
    } catch (error) {
      console.error('Error in getFlavorAnalytics:', error)
      // Return empty data on any error
      return {
        topFlavors: [],
        popularFlavors: []
      }
    }
  }

  // Get recent activity
  static async getRecentActivity(): Promise<RecentActivity[]> {
    const { data: requests, error: requestsError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (requestsError) throw new Error('Failed to fetch recent requests')

    const activities: RecentActivity[] = requests?.map(request => ({
      id: request.id,
      type: 'order',
      title: `New request from ${request.customer_name}`,
      description: `${request.customer_email} - £${request.estimated_total}`,
      timestamp: request.created_at,
      amount: parseFloat(request.estimated_total)
    })) || []

    return activities
  }

  // Get requests for this week
  static async getThisWeekRequests(): Promise<number> {
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .gte('collection_date', weekStart.toISOString())
      .lt('collection_date', weekEnd.toISOString())

    if (error) throw new Error('Failed to fetch this week requests')

    return data?.length || 0
  }
} 