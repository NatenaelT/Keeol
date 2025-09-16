'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  TrendingUp,
  Heart,
  Star,
  Phone,
  Mail,
  Calendar,
  ShoppingBag,
  DollarSign,
  Award,
  Search,
  Filter,
  Download,
  UserPlus,
  MessageSquare,
  BarChart3
} from 'lucide-react'
import RoleGuard from '@/components/auth/RoleGuard'

interface Customer {
  id: string
  name: string
  email?: string
  phone_number: string
  loyalty_tier: string
  loyalty_points: number
  total_orders: number
  total_spent: number
  last_order_date?: string
  favorite_items: string[]
  created_at: string
  status: 'active' | 'inactive' | 'vip'
}

const CRMDashboard = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const stats = {
    totalCustomers: 127,
    activeCustomers: 95,
    vipCustomers: 18,
    averageOrderValue: 438,
    customerRetention: 78.5,
    customerSatisfaction: 4.6
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    // Mock customer data
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'Kidus Alemayehu',
        email: 'kidus@email.com',
        phone_number: '+251911234567',
        loyalty_tier: 'Gold',
        loyalty_points: 1850,
        total_orders: 15,
        total_spent: 6750,
        last_order_date: new Date(Date.now() - 86400000).toISOString(),
        favorite_items: ['keol Special Burger', 'Margherita Pizza'],
        created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        status: 'vip'
      },
      {
        id: '2',
        name: 'Hanan Mohammed',
        phone_number: '+251922345678',
        loyalty_tier: 'Silver',
        loyalty_points: 1200,
        total_orders: 8,
        total_spent: 3520,
        last_order_date: new Date(Date.now() - 172800000).toISOString(),
        favorite_items: ['Chicken Deluxe', 'Fries'],
        created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
        status: 'active'
      },
      {
        id: '3',
        name: 'Dawit Gebre',
        email: 'dawit.g@email.com',
        phone_number: '+251933456789',
        loyalty_tier: 'Bronze',
        loyalty_points: 650,
        total_orders: 4,
        total_spent: 1800,
        last_order_date: new Date(Date.now() - 259200000).toISOString(),
        favorite_items: ['Pizza Pepperoni'],
        created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
        status: 'active'
      },
      {
        id: '4',
        name: 'Sara Bekele',
        phone_number: '+251944567890',
        loyalty_tier: 'Bronze',
        loyalty_points: 350,
        total_orders: 2,
        total_spent: 890,
        last_order_date: new Date(Date.now() - 345600000).toISOString(),
        favorite_items: ['Burger Classic'],
        created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
        status: 'inactive'
      }
    ]

    setCustomers(mockCustomers)
    setIsLoading(false)
  }

  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.phone_number.includes(searchTerm) ||
                           customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesTier = filterTier === 'all' || customer.loyalty_tier.toLowerCase() === filterTier
      const matchesStatus = filterStatus === 'all' || customer.status === filterStatus
      
      return matchesSearch && matchesTier && matchesStatus
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return 'bg-purple-100 text-purple-800'
      case 'active': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
      day: 'numeric'
    })
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
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={['operation_manager', 'admin', 'owner']}>
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container-responsive py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Customer Relationship Management</h1>
            <p className="text-gray-600 mt-2">Manage customer relationships and drive engagement</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers.toLocaleString()}
              change={8.2}
              icon={Users}
              color="bg-blue-500"
            />
            <StatCard
              title="Active Customers"
              value={stats.activeCustomers.toLocaleString()}
              change={5.4}
              icon={TrendingUp}
              color="bg-green-500"
            />
            <StatCard
              title="VIP Customers"
              value={stats.vipCustomers.toLocaleString()}
              change={12.3}
              icon={Award}
              color="bg-purple-500"
            />
            <StatCard
              title="Avg Order Value"
              value={formatCurrency(stats.averageOrderValue)}
              change={3.1}
              icon={DollarSign}
              color="bg-orange-500"
            />
            <StatCard
              title="Retention Rate"
              value={`${stats.customerRetention}%`}
              change={2.8}
              icon={Heart}
              color="bg-red-500"
            />
            <StatCard
              title="Satisfaction"
              value={`${stats.customerSatisfaction}/5`}
              change={1.2}
              icon={Star}
              color="bg-yellow-500"
            />
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Tiers</option>
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button className="btn-outline flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button className="btn-primary flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Add Customer
                </button>
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Database ({getFilteredCustomers().length} customers)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders & Spending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredCustomers().map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">
                              {customer.loyalty_points} points
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.phone_number}
                          </div>
                          {customer.email && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(customer.loyalty_tier)}`}>
                            {customer.loyalty_tier}
                          </span>
                          <br />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                            {customer.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          <div>{customer.total_orders} orders</div>
                          <div className="font-medium">{formatCurrency(customer.total_spent)}</div>
                          <div className="text-xs text-gray-500">
                            Avg: {formatCurrency(customer.total_spent / customer.total_orders)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.last_order_date ? (
                          <div className="space-y-1">
                            <div>{formatDate(customer.last_order_date)}</div>
                            <div className="text-xs">
                              {customer.favorite_items[0]}
                            </div>
                          </div>
                        ) : (
                          'No orders yet'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-brand-red hover:text-brand-red-dark">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900">
                            <BarChart3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}

export default CRMDashboard
