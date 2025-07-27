import { supabase } from './supabaseClient'

export interface OrderRequestStats {
  totalRequests: number
  totalEstimatedValue: number
  averageRequestValue: number
  recentRequests: number
  newRequests: number
}

export interface CustomerInsights {
  totalCustomers: number
  repeatCustomers: number
  averageCustomerValue: number
  topCustomers: Array<{
    name: string
    email: string
    totalRequests: number
    totalEstimatedValue: number
  }>
}

export interface FlavorAnalytics {
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
  // Get overall order request statistics
  static async getOrderRequestStats(): Promise<OrderRequestStats> {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get total requests and estimated value
    const { data: totalData, error: totalError } = await supabase
      .from('order_requests')
      .select('estimated_total')

    if (totalError) throw new Error('Failed to fetch order request stats')

    const totalRequests = totalData?.length || 0
    const totalEstimatedValue = totalData?.reduce((sum, request) => sum + parseFloat(request.estimated_total), 0) || 0
    const averageRequestValue = totalRequests > 0 ? totalEstimatedValue / totalRequests : 0

    // Get recent requests (last 7 days)
    const { data: recentData, error: recentError } = await supabase
      .from('order_requests')
      .select('id')
      .gte('request_date', weekAgo.toISOString())

    if (recentError) throw new Error('Failed to fetch recent requests')

    const recentRequests = recentData?.length || 0

    // Get new requests
    const { data: newData, error: newError } = await supabase
      .from('order_requests')
      .select('id')
      .eq('status', 'new_request')

    if (newError) throw new Error('Failed to fetch new requests')

    const newRequests = newData?.length || 0

    return {
      totalRequests,
      totalEstimatedValue,
      averageRequestValue,
      recentRequests,
      newRequests
    }
  }

  // Get customer insights
  static async getCustomerInsights(): Promise<CustomerInsights> {
    // Get total customers from customers table
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .order('total_estimated_value', { ascending: false })

    if (customersError) throw new Error('Failed to fetch customers')

    const totalCustomers = customers?.length || 0
    const repeatCustomers = customers?.filter(c => c.total_requests > 1).length || 0
    const averageCustomerValue = totalCustomers > 0 
      ? customers?.reduce((sum, c) => sum + parseFloat(c.total_estimated_value), 0) / totalCustomers || 0
      : 0

    const topCustomers = customers?.slice(0, 5).map(c => ({
      name: c.name,
      email: c.email,
      totalRequests: c.total_requests,
      totalEstimatedValue: parseFloat(c.total_estimated_value)
    })) || []

    return {
      totalCustomers,
      repeatCustomers,
      averageCustomerValue,
      topCustomers
    }
  }

  // Get flavor analytics
  static async getFlavorAnalytics(): Promise<FlavorAnalytics> {
    try {
      // First, try to get request items with flavor data using a simpler approach
      const { data: flavorData, error: flavorError } = await supabase
        .from('request_items')
        .select('item_name, estimated_total_price, cake_flavor_id')
        .not('cake_flavor_id', 'is', null)

      if (flavorError) {
        console.warn('Flavor analytics error:', flavorError)
        // Return empty data if there's an error or no data
        return {
          topFlavors: [],
          popularFlavors: []
        }
      }

      // If no flavor data, return empty arrays
      if (!flavorData || flavorData.length === 0) {
        return {
          topFlavors: [],
          popularFlavors: []
        }
      }

      // Group by flavor - now we need to get flavor names separately
      const flavorStats = new Map()
      
      // Get unique flavor IDs to fetch their names
      const flavorIds = Array.from(new Set(flavorData.map((item: any) => item.cake_flavor_id).filter(Boolean)))
      
      // Fetch flavor names if we have flavor IDs
      let flavorNames: { [key: string]: string } = {}
      if (flavorIds.length > 0) {
        const { data: flavors, error: flavorsError } = await supabase
          .from('cake_flavors')
          .select('id, name')
          .in('id', flavorIds)
        
        if (!flavorsError && flavors) {
          flavors.forEach((flavor: any) => {
            flavorNames[flavor.id] = flavor.name
          })
        }
      }
      
      flavorData.forEach((item: any) => {
        const flavorName = flavorNames[item.cake_flavor_id] || item.item_name || 'Unknown Flavor'
        if (!flavorStats.has(flavorName)) {
          flavorStats.set(flavorName, { orderCount: 0, revenue: 0 })
        }
        const stats = flavorStats.get(flavorName)
        stats.orderCount++
        stats.revenue += parseFloat(item.estimated_total_price || 0)
      })

      const topFlavors = Array.from(flavorStats.entries())
        .map(([name, stats]) => ({
          name,
          orderCount: stats.orderCount,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5)

      // Get popular flavors by unique customers
      const { data: customerFlavorData, error: customerFlavorError } = await supabase
        .from('customers')
        .select('favorite_flavor')
        .not('favorite_flavor', 'is', null)

      if (customerFlavorError) {
        console.warn('Customer flavor analytics error:', customerFlavorError)
      }

      const flavorCustomerCount = new Map()
      customerFlavorData?.forEach(customer => {
        const flavor = customer.favorite_flavor
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
      .from('order_requests')
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
      .from('order_requests')
      .select('id')
      .gte('request_date', weekStart.toISOString())
      .lt('request_date', weekEnd.toISOString())

    if (error) throw new Error('Failed to fetch this week requests')

    return data?.length || 0
  }
} 