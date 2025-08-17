'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Image, 
  Cake, 
  Calendar, 
  Mail, 
  TrendingUp,
  Users,
  ShoppingCart,
  PoundSterling,
  Clock,
  Star
} from 'lucide-react'
import { OrderAnalyticsService, OrderStats, CustomerInsights, CakeAnalytics, RecentActivity } from '@/lib/orderAnalyticsService'
import LoadingSpinner from '@/components/ui/loading-spinner'

interface DashboardOverviewProps {
  onSectionChange: (section: string, filter?: string) => void
}

export default function DashboardOverview({ onSectionChange }: DashboardOverviewProps) {
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [customerInsights, setCustomerInsights] = useState<CustomerInsights | null>(null)
  const [cakeAnalytics, setCakeAnalytics] = useState<CakeAnalytics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [stats, insights, flavors, activity] = await Promise.all([
        OrderAnalyticsService.getOrderStats(),
        OrderAnalyticsService.getCustomerInsights(),
        OrderAnalyticsService.getFlavorAnalytics(),
        OrderAnalyticsService.getRecentActivity()
      ])
      
      setOrderStats(stats)
      setCustomerInsights(insights)
      setCakeAnalytics(flavors)
      setRecentActivity(activity)
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard where you can view analytics of your orders and customers.</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading dashboard..." size={120} />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="cursor-default">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <ShoppingCart className="h-4 w-4 text-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orderStats?.totalOrders || 0}</div>
                <p className="text-xs text-gray-600">All time</p>
              </CardContent>
            </Card>

            <Card className="cursor-default">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated Value</CardTitle>
                <PoundSterling className="h-4 w-4 text-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">£{orderStats?.totalEstimatedValue.toFixed(0) || 0}</div>
                <p className="text-xs text-gray-600">All time</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-orange-50"
              onClick={() => onSectionChange('orders', 'new_request')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Requests</CardTitle>
                <Clock className="h-4 w-4 text-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orderStats?.newOrders || 0}</div>
                <p className="text-xs text-gray-600">Need attention</p>
              </CardContent>
            </Card>

            <Card className="cursor-default">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orderStats?.recentOrders || 0}</div>
                <p className="text-xs text-gray-600">New requests</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Analytics Section */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{activity.title}</div>
                        <div className="text-xs text-gray-600">
                          {activity.description} - {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      {activity.amount && (
                        <div className="text-sm font-medium text-green-600">
                          £{activity.amount}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange" />
                Customer Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange">{customerInsights?.totalCustomers || 0}</div>
                    <div className="text-xs text-gray-600">Total Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{customerInsights?.repeatCustomers || 0}</div>
                    <div className="text-xs text-gray-600">Repeat Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">£{customerInsights?.averageCustomerValue.toFixed(0) || 0}</div>
                    <div className="text-xs text-gray-600">Average Value</div>
                  </div>
                </div>
                {customerInsights?.topCustomers && customerInsights.topCustomers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Top Customers</h4>
                    <div className="space-y-2">
                      {customerInsights.topCustomers.slice(0, 3).map((customer, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="truncate">{customer.name}</span>
                          <span className="text-green-600 font-medium">£{customer.totalEstimatedValue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Flavor Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-orange" />
                Popular Flavors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cakeAnalytics?.topFlavors && cakeAnalytics.topFlavors.length > 0 ? (
                  <div className="space-y-3">
                    {cakeAnalytics.topFlavors.slice(0, 5).map((flavor, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange"></div>
                          <span className="text-sm font-medium">{flavor.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{flavor.orderCount} orders</div>
                          <div className="text-xs text-gray-600">£{flavor.revenue.toFixed(0)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No flavor data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 