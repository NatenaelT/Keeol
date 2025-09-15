'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UtensilsCrossed, 
  BarChart3, 
  Settings,
  CreditCard,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  ShoppingBag,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import MobileNavigation from '@/components/layout/MobileNavigation'
import RoleGuard from '@/components/auth/RoleGuard'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  pendingOrders: number
  completedOrders: number
  totalMenuItems: number
  revenueGrowth: number
  orderGrowth: number
  userGrowth: number
}

interface QuickStats {
  label: string
  value: string | number
  change: number
  icon: any
  color: string
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data
  useEffect(() => {
    const mockStats: DashboardStats = {
      totalUsers: 1248,
      activeUsers: 892,
      totalOrders: 3567,
      totalRevenue: 458920,
      avgOrderValue: 287,
      pendingOrders: 23,
      completedOrders: 89,
      totalMenuItems: 47,
      revenueGrowth: 12.5,
      orderGrowth: 8.3,
      userGrowth: 15.2
    }

    const mockRecentOrders = [
      {
        id: 'KBP-001',
        customer: 'John Doe',
        total: 450,
        status: 'delivered',
        time: '10 min ago'
      },
      {
        id: 'KBP-002', 
        customer: 'Jane Smith',
        total: 320,
        status: 'preparing',
        time: '15 min ago'
      },
      {
        id: 'KBP-003',
        customer: 'Mike Johnson', 
        total: 680,
        status: 'confirmed',
        time: '22 min ago'
      }
    ]

    const mockRecentUsers = [
      {
        id: '1',
        name: 'Alice Wilson',
        role: 'customer',
        joined: '2 hours ago',
        status: 'active'
      },
      {
        id: '2', 
        name: 'Bob Chen',
        role: 'customer',
        joined: '4 hours ago',
        status: 'active'
      },
      {
        id: '3',
        name: 'Carol Davis',
        role: 'waiter',
        joined: '1 day ago',
        status: 'active'
      }
    ]

    setTimeout(() => {
      setStats(mockStats)
      setRecentOrders(mockRecentOrders)
      setRecentUsers(mockRecentUsers)
      setIsLoading(false)
    }, 1000)
  }, [])

  const quickStats: QuickStats[] = [
    {
      label: 'Total Revenue',
      value: stats ? `${stats.totalRevenue.toLocaleString()} ETB` : '0',
      change: stats?.revenueGrowth || 0,
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      change: stats?.orderGrowth || 0,
      icon: ShoppingBag,
      color: 'blue'
    },
    {
      label: 'Active Users',
      value: stats?.activeUsers || 0,
      change: stats?.userGrowth || 0,
      icon: UserCheck,
      color: 'purple'
    },
    {
      label: 'Avg Order Value',
      value: stats ? `${stats.avgOrderValue} ETB` : '0',
      change: 5.2,
      icon: TrendingUp,
      color: 'orange'
    }
  ]

  const quickActions = [
    {
      title: 'Menu Management',
      description: 'Add, edit, or remove menu items',
      href: '/admin/menu',
      icon: UtensilsCrossed,
      color: 'bg-red-500'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and roles',
      href: '/admin/users',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Analytics & Reports',
      description: 'View detailed analytics and reports',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'bg-green-500'
    },
    {
      title: 'Payment Management',
      description: 'View transactions and payment settings',
      href: '/admin/payments',
      icon: CreditCard,
      color: 'bg-purple-500'
    },
    {
      title: 'CRM & Support',
      description: 'Manage customer support and CRM',
      href: '/dashboard/crm',
      icon: MessageCircle,
      color: 'bg-orange-500'
    },
    {
      title: 'System Settings',
      description: 'Configure app settings and preferences',
      href: '/admin/settings',
      icon: Settings,
      color: 'bg-gray-500'
    }
  ]

  const orderStatusConfig = {
    pending: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock },
    confirmed: { color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle },
    preparing: { color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertTriangle },
    delivered: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-20 lg:pb-8">
          <div className="container-responsive py-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-300 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-300 rounded"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-64 bg-gray-300 rounded"></div>
                <div className="h-64 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <MobileNavigation />
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['admin', 'owner']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="pt-20 pb-20 lg:pb-8">
          <div className="container-responsive py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening at Keeol Burger.</p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {quickStats.map((stat, index) => (
                <div key={index} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 bg-${stat.color}-500 rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    {stat.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.change > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </span>
                    <span className="text-sm text-gray-600 ml-1">from last month</span>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="card hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-brand-red transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 text-sm">{action.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-brand-red transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <Link 
                    href="/admin/orders" 
                    className="text-brand-red hover:text-brand-red-dark text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {recentOrders.map((order) => {
                    const statusInfo = orderStatusConfig[order.status as keyof typeof orderStatusConfig]
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${statusInfo.bg} rounded-full flex items-center justify-center`}>
                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">#{order.id}</p>
                            <p className="text-sm text-gray-600">{order.customer}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{order.total} ETB</p>
                          <p className="text-xs text-gray-500">{order.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Recent Users */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">New Users</h3>
                  <Link 
                    href="/admin/users" 
                    className="text-brand-red hover:text-brand-red-dark text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`w-2 h-2 rounded-full ${
                          user.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                        } mb-1`}></div>
                        <p className="text-xs text-gray-500">{user.joined}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* System Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">System Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">All Systems Operational</h4>
                    <p className="text-sm text-gray-600">Website, payments, and notifications working normally</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Average Response Time</h4>
                    <p className="text-sm text-gray-600">2.3 seconds across all endpoints</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">Uptime</h4>
                    <p className="text-sm text-gray-600">99.9% uptime this month</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <MobileNavigation />
      </div>
    </RoleGuard>
  )
}

export default AdminDashboard
