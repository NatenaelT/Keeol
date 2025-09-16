'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  UserPlus,
  Activity,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Calendar,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react'
import RoleGuard from '@/components/auth/RoleGuard'
import { useAuth } from '@/contexts/AuthContext'

interface UserStats {
  totalUsers: number
  newUsersToday: number
  activeUsers: number
  loyaltyTiers: {
    bronze: number
    silver: number
    gold: number
    platinum: number
  }
}

interface OrderStats {
  totalOrders: number
  todayOrders: number
  totalRevenue: number
  todayRevenue: number
  averageOrderValue: number
}

interface RecentUser {
  id: string
  name: string
  email?: string
  phone_number: string
  role: string
  loyalty_tier: string
  loyalty_points: number
  created_at: string
  last_login?: string
  total_orders?: number
  total_spent?: number
}

const AdminDashboard = () => {
  const { user } = useAuth()
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    loyaltyTiers: { bronze: 0, silver: 0, gold: 0, platinum: 0 }
  })
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    averageOrderValue: 0
  })
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [usersResponse, ordersResponse, recentResponse] = await Promise.all([
        fetch('/api/admin/analytics/users'),
        fetch('/api/admin/analytics/orders'),
        fetch('/api/admin/analytics/recent-users')
      ])

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUserStats(usersData)
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrderStats(ordersData)
      }

      if (recentResponse.ok) {
        const recentData = await recentResponse.json()
        setRecentUsers(recentData.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from yesterday
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'bg-purple-100 text-purple-800'
      case 'gold': return 'bg-yellow-100 text-yellow-800'
      case 'silver': return 'bg-gray-100 text-gray-800'
      default: return 'bg-orange-100 text-orange-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'owner': return 'bg-purple-100 text-purple-800'
      case 'operation_manager': return 'bg-blue-100 text-blue-800'
      case 'staff': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['admin', 'owner']}>
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container-responsive py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name}. Here's what's happening at keol Burger today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={userStats.totalUsers.toLocaleString()}
              change={userStats.newUsersToday}
              icon={Users}
              color="bg-blue-500"
            />
            <StatCard
              title="Today's Orders"
              value={orderStats.todayOrders.toLocaleString()}
              icon={ShoppingBag}
              color="bg-green-500"
            />
            <StatCard
              title="Today's Revenue"
              value={formatCurrency(orderStats.todayRevenue)}
              icon={DollarSign}
              color="bg-purple-500"
            />
            <StatCard
              title="Active Users"
              value={userStats.activeUsers.toLocaleString()}
              icon={Activity}
              color="bg-orange-500"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Loyalty Tiers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Loyalty Tiers</h3>
                <Award className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-4">
                {Object.entries(userStats.loyaltyTiers).map(([tier, count]) => (
                  <div key={tier} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-lg text-sm font-medium ${getTierColor(tier)}`}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </span>
                    </div>
                    <span className="text-gray-900 font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
                <BarChart3 className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Orders</span>
                  <span className="text-gray-900 font-medium">{orderStats.totalOrders.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(orderStats.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Order Value</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(orderStats.averageOrderValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">New Users Today</span>
                  <span className="text-gray-900 font-medium">{userStats.newUsersToday}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                <UserPlus className="w-5 h-5 text-gray-500" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">
                              Joined {formatDate(user.created_at)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {user.phone_number}
                          </div>
                          {user.email && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {user.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                          <br />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(user.loyalty_tier)}`}>
                            {user.loyalty_tier}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          <div>Orders: {user.total_orders || 0}</div>
                          <div>Spent: {formatCurrency(user.total_spent || 0)}</div>
                          {user.last_login && (
                            <div className="text-xs text-gray-500">
                              Last: {formatDate(user.last_login)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {user.loyalty_points || 0}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.a
              href="/admin/users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="block bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                  <p className="text-gray-600">View and manage user accounts</p>
                </div>
              </div>
            </motion.a>

            <motion.a
              href="/dashboard/crm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="block bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">CRM Dashboard</h3>
                  <p className="text-gray-600">Customer relationship management</p>
                </div>
              </div>
            </motion.a>

            <motion.a
              href="/admin/cms"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="block bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 rounded-full">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Content Management</h3>
                  <p className="text-gray-600">Manage menus and content</p>
                </div>
              </div>
            </motion.a>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}

export default AdminDashboard
