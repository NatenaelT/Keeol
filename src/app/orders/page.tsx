'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  Truck, 
  Star, 
  RotateCcw,
  Eye,
  Filter,
  Search,
  Calendar,
  Package,
  ChefHat
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import MobileNavigation from '@/components/layout/MobileNavigation'
import RoleGuard from '@/components/auth/RoleGuard'

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  customizations?: string[]
}

interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
  placedAt: string
  deliveredAt?: string
  total: number
  items: OrderItem[]
  rating?: number
  restaurant: {
    name: string
    address: string
  }
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { user } = useAuth()

  // Mock orders data
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'KBP-2024-0123',
        status: 'delivered',
        placedAt: '2024-01-15T14:30:00Z',
        deliveredAt: '2024-01-15T15:15:00Z',
        total: 1440,
        rating: 5,
        items: [
          { id: '1', name: 'keol Special Burger', quantity: 2, price: 450 },
          { id: '2', name: 'Margherita Pizza', quantity: 1, price: 380 },
          { id: '3', name: 'Ethiopian Coffee', quantity: 2, price: 80 }
        ],
        restaurant: {
          name: 'keol - Bole Branch',
          address: 'Bole Road, Near Edna Mall'
        }
      },
      {
        id: '2',
        orderNumber: 'KBP-2024-0124',
        status: 'out_for_delivery',
        placedAt: '2024-01-16T12:00:00Z',
        total: 850,
        items: [
          { id: '4', name: 'Veggie Delight Pizza', quantity: 1, price: 420 },
          { id: '5', name: 'Spicy Chicken Wings', quantity: 1, price: 320, customizations: ['Extra Spicy'] },
          { id: '6', name: 'Chocolate Milkshake', quantity: 1, price: 150 }
        ],
        restaurant: {
          name: 'keol - Bole Branch',
          address: 'Bole Road, Near Edna Mall'
        }
      },
      {
        id: '3',
        orderNumber: 'KBP-2024-0125',
        status: 'confirmed',
        placedAt: '2024-01-16T18:30:00Z',
        total: 530,
        items: [
          { id: '7', name: 'Classic Burger', quantity: 1, price: 350 },
          { id: '8', name: 'Ethiopian Coffee', quantity: 2, price: 80 }
        ],
        restaurant: {
          name: 'keol - Kazanchis Branch',
          address: 'Kazanchis, Commercial Area'
        }
      }
    ]

    setTimeout(() => {
      setOrders(mockOrders)
      setFilteredOrders(mockOrders)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Filter orders based on search and filters
  useEffect(() => {
    let filtered = orders

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const orderDate = new Date()
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(order => {
            const orderTime = new Date(order.placedAt)
            return orderTime.toDateString() === now.toDateString()
          })
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(order => {
            const orderTime = new Date(order.placedAt)
            return orderTime >= weekAgo
          })
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(order => {
            const orderTime = new Date(order.placedAt)
            return orderTime >= monthAgo
          })
          break
      }
    }

    setFilteredOrders(filtered)
  }, [orders, searchQuery, statusFilter, dateFilter])

  const statusConfig = {
    pending: { color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock, label: 'Pending' },
    confirmed: { color: 'text-blue-600', bg: 'bg-blue-100', icon: CheckCircle, label: 'Confirmed' },
    preparing: { color: 'text-orange-600', bg: 'bg-orange-100', icon: ChefHat, label: 'Preparing' },
    ready: { color: 'text-purple-600', bg: 'bg-purple-100', icon: Package, label: 'Ready' },
    out_for_delivery: { color: 'text-indigo-600', bg: 'bg-indigo-100', icon: Truck, label: 'Out for Delivery' },
    delivered: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, label: 'Delivered' },
    cancelled: { color: 'text-red-600', bg: 'bg-red-100', icon: Clock, label: 'Cancelled' }
  }

  const reorderItems = async (order: Order) => {
    try {
      // Simulate adding items to cart
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`${order.items.length} items added to cart!`)
    } catch (error) {
      toast.error('Failed to reorder items')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getOrderSummary = () => {
    const totalOrders = orders.length
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length
    const totalSpent = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0)
    
    return { totalOrders, deliveredOrders, totalSpent }
  }

  const { totalOrders, deliveredOrders, totalSpent } = getOrderSummary()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-20 lg:pb-8">
          <div className="container-responsive py-8">
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <MobileNavigation />
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles="customer">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
              <p className="text-gray-600">Track your orders and reorder your favorites</p>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <div className="card text-center">
                <div className="text-2xl font-bold text-brand-red mb-1">{totalOrders}</div>
                <div className="text-gray-600">Total Orders</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">{deliveredOrders}</div>
                <div className="text-gray-600">Delivered</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">{totalSpent} ETB</div>
                <div className="text-gray-600">Total Spent</div>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card mb-8"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search orders or items..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Date Filter */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </motion.div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center py-16"
              >
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : "You haven't placed any orders yet"
                  }
                </p>
                <Link href="/menu" className="btn-primary">
                  Browse Menu
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order, index) => {
                  const statusInfo = statusConfig[order.status]
                  const StatusIcon = statusInfo.icon

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="card hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                        <div className="flex items-center gap-4 mb-4 lg:mb-0">
                          <div className={`w-12 h-12 ${statusInfo.bg} rounded-lg flex items-center justify-center`}>
                            <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.orderNumber}
                            </h3>
                            <p className="text-gray-600">{formatDate(order.placedAt)}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bg}`}>
                                {statusInfo.label}
                              </span>
                              {order.status === 'delivered' && order.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  <span className="text-sm text-gray-600">{order.rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-gray-900">
                            {order.total} ETB
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="btn-outline py-2 px-4 text-sm flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            {order.status === 'delivered' && (
                              <button
                                onClick={() => reorderItems(order)}
                                className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Reorder
                              </button>
                            )}
                            {(order.status === 'confirmed' || order.status === 'preparing' || order.status === 'out_for_delivery') && (
                              <Link
                                href={`/track?order=${order.orderNumber}`}
                                className="btn-secondary py-2 px-4 text-sm flex items-center gap-2"
                              >
                                <Truck className="w-4 h-4" />
                                Track
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {order.items.length} items from {order.restaurant.name}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {item.quantity}x {item.name}
                                {item.customizations && (
                                  <span className="text-brand-red ml-1">
                                    ({item.customizations.join(', ')})
                                  </span>
                                )}
                              </span>
                              <span className="text-gray-900 font-medium">
                                {item.price * item.quantity} ETB
                              </span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-gray-500">
                              +{order.items.length - 2} more items
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Order Detail Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedOrder(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Order #{selectedOrder.orderNumber}
                      </h2>
                      <p className="text-gray-600">{formatDate(selectedOrder.placedAt)}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  {/* Items */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Items Ordered</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            {item.customizations && (
                              <p className="text-sm text-brand-red">
                                {item.customizations.join(', ')}
                              </p>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">
                            {item.price * item.quantity} ETB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4 mb-6">
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-brand-red">{selectedOrder.total} ETB</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {selectedOrder.status === 'delivered' && (
                      <button
                        onClick={() => {
                          reorderItems(selectedOrder)
                          setSelectedOrder(null)
                        }}
                        className="flex-1 btn-primary flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reorder
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="flex-1 btn-outline"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <MobileNavigation />
      </div>
    </RoleGuard>
  )
}

export default OrdersPage
