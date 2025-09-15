'use client'

import { motion } from 'framer-motion'
import { 
  ChefHat, 
  Users, 
  Truck, 
  BarChart3, 
  Clock, 
  Bell,
  Calendar,
  MessageSquare,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRoleAccess } from '@/hooks/useRoleAccess'
import RoleGuard from '@/components/auth/RoleGuard'
import Header from '@/components/layout/Header'

const StaffPortalPage = () => {
  const { 
    user, 
    isWaiter, 
    isChef, 
    isDelivery, 
    isOperationManager,
    isAdminOrOwner,
    canViewKitchen,
    canViewReports,
    getNavigationItems
  } = useRoleAccess()

  const quickActions = [
    {
      title: 'Kitchen Orders',
      description: 'View and manage kitchen queue',
      icon: ChefHat,
      href: '/staff/kitchen',
      color: 'bg-red-500',
      show: canViewKitchen(),
      count: 8
    },
    {
      title: 'Table Management',
      description: 'Manage restaurant tables',
      icon: Users,
      href: '/staff/tables',
      color: 'bg-blue-500',
      show: isWaiter() || isOperationManager() || isAdminOrOwner(),
      count: 12
    },
    {
      title: 'Delivery Queue',
      description: 'Active delivery orders',
      icon: Truck,
      href: '/staff/delivery',
      color: 'bg-green-500',
      show: isDelivery() || isOperationManager() || isAdminOrOwner(),
      count: 5
    },
    {
      title: 'Reports',
      description: 'View performance reports',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-purple-500',
      show: canViewReports(),
      count: null
    }
  ]

  const todayStats = [
    {
      label: 'Orders Today',
      value: '47',
      change: '+12%',
      positive: true,
      show: true
    },
    {
      label: 'Average Prep Time',
      value: '14 min',
      change: '-2 min',
      positive: true,
      show: canViewKitchen()
    },
    {
      label: 'Tables Served',
      value: '23',
      change: '+8%',
      positive: true,
      show: isWaiter() || isOperationManager() || isAdminOrOwner()
    },
    {
      label: 'Deliveries',
      value: '15',
      change: '+5',
      positive: true,
      show: isDelivery() || isOperationManager() || isAdminOrOwner()
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'order',
      message: 'New order #1234 received',
      time: '2 min ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'delivery',
      message: 'Order #1230 out for delivery',
      time: '5 min ago',
      priority: 'normal'
    },
    {
      id: 3,
      type: 'kitchen',
      message: 'Order #1229 ready for pickup',
      time: '8 min ago',
      priority: 'normal'
    },
    {
      id: 4,
      type: 'table',
      message: 'Table 7 requested assistance',
      time: '12 min ago',
      priority: 'medium'
    }
  ]

  return (
    <RoleGuard allowedRoles={['waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="pt-20">
          <div className="container-responsive py-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-gray-600 capitalize">
                {user?.role?.replace('_', ' ')} Portal
              </p>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {quickActions.filter(action => action.show).map((action, index) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    {action.count && (
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
                        {action.count}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {action.description}
                  </p>
                </Link>
              ))}
            </motion.div>

            {/* Today's Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              {todayStats.filter(stat => stat.show).map((stat, index) => (
                <div key={stat.label} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`flex items-center text-sm ${
                      stat.positive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {stat.change}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                    <Bell className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 ${
                          activity.priority === 'high'
                            ? 'border-red-400 bg-red-50'
                            : activity.priority === 'medium'
                              ? 'border-yellow-400 bg-yellow-50'
                              : 'border-green-400 bg-green-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'order'
                            ? 'bg-blue-100 text-blue-600'
                            : activity.type === 'delivery'
                              ? 'bg-green-100 text-green-600'
                              : activity.type === 'kitchen'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-purple-100 text-purple-600'
                        }`}>
                          {activity.type === 'order' && <Bell className="w-4 h-4" />}
                          {activity.type === 'delivery' && <Truck className="w-4 h-4" />}
                          {activity.type === 'kitchen' && <ChefHat className="w-4 h-4" />}
                          {activity.type === 'table' && <Users className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                        {activity.priority === 'high' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Quick Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                {/* Schedule */}
                <div className="card">
                  <div className="flex items-center mb-4">
                    <Calendar className="w-5 h-5 text-brand-red mr-2" />
                    <h3 className="font-semibold text-gray-900">Today's Schedule</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shift Start</span>
                      <span className="font-medium">9:00 AM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Break</span>
                      <span className="font-medium">1:00 PM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shift End</span>
                      <span className="font-medium">6:00 PM</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <MessageSquare className="w-5 h-5 text-brand-red mr-2" />
                      <h3 className="font-semibold text-gray-900">Messages</h3>
                    </div>
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      3
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Manager</p>
                      <p className="text-gray-600">Team meeting at 3 PM</p>
                      <p className="text-xs text-gray-400">2 hours ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Kitchen</p>
                      <p className="text-gray-600">New menu items added</p>
                      <p className="text-xs text-gray-400">4 hours ago</p>
                    </div>
                  </div>
                  <Link 
                    href="/staff/messages" 
                    className="text-brand-red text-sm font-medium hover:text-brand-red-dark mt-3 inline-block"
                  >
                    View all messages →
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}

export default StaffPortalPage
