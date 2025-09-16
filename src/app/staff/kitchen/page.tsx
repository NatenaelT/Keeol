'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChefHat, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Flame,
  Users,
  Timer,
  Bell,
  Filter,
  RefreshCw,
  Eye,
  Play,
  Pause,
  Check
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import MobileNavigation from '@/components/layout/MobileNavigation'
import RoleGuard from '@/components/auth/RoleGuard'

interface OrderItem {
  id: string
  name: string
  quantity: number
  customizations: string[]
  prepTime: number
  priority: 'low' | 'medium' | 'high'
}

interface KitchenOrder {
  id: string
  orderNumber: string
  tableNumber?: string
  customerName: string
  orderType: 'dine_in' | 'takeaway' | 'delivery'
  status: 'new' | 'preparing' | 'ready' | 'delayed'
  priority: 'low' | 'medium' | 'high'
  placedAt: string
  estimatedTime: number
  actualStartTime?: string
  items: OrderItem[]
  notes?: string
  allergies?: string[]
}

const KitchenDashboard = () => {
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Mock kitchen orders
  useEffect(() => {
    const mockOrders: KitchenOrder[] = [
      {
        id: '1',
        orderNumber: 'KBP-001',
        tableNumber: '7',
        customerName: 'John Doe',
        orderType: 'dine_in',
        status: 'preparing',
        priority: 'high',
        placedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        estimatedTime: 15,
        actualStartTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        items: [
          {
            id: '1',
            name: 'keol Special Burger',
            quantity: 2,
            customizations: ['No pickles', 'Extra cheese'],
            prepTime: 12,
            priority: 'high'
          },
          {
            id: '2',
            name: 'Spicy Wings',
            quantity: 1,
            customizations: ['Extra spicy'],
            prepTime: 8,
            priority: 'medium'
          }
        ],
        notes: 'Customer has nut allergy',
        allergies: ['Nuts']
      },
      {
        id: '2',
        orderNumber: 'KBP-002',
        customerName: 'Jane Smith',
        orderType: 'delivery',
        status: 'new',
        priority: 'medium',
        placedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        estimatedTime: 20,
        items: [
          {
            id: '3',
            name: 'Margherita Pizza',
            quantity: 1,
            customizations: ['Thin crust'],
            prepTime: 18,
            priority: 'medium'
          },
          {
            id: '4',
            name: 'Ethiopian Coffee',
            quantity: 2,
            customizations: [],
            prepTime: 3,
            priority: 'low'
          }
        ]
      },
      {
        id: '3',
        orderNumber: 'KBP-003',
        tableNumber: '12',
        customerName: 'Mike Johnson',
        orderType: 'dine_in',
        status: 'ready',
        priority: 'low',
        placedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        estimatedTime: 15,
        actualStartTime: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        items: [
          {
            id: '5',
            name: 'Veggie Burger',
            quantity: 1,
            customizations: ['Gluten-free bun'],
            prepTime: 10,
            priority: 'low'
          }
        ],
        allergies: ['Gluten']
      },
      {
        id: '4',
        orderNumber: 'KBP-004',
        customerName: 'Sarah Wilson',
        orderType: 'takeaway',
        status: 'delayed',
        priority: 'high',
        placedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        estimatedTime: 12,
        actualStartTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        items: [
          {
            id: '6',
            name: 'Chicken Pizza',
            quantity: 1,
            customizations: ['Double chicken', 'No onions'],
            prepTime: 15,
            priority: 'high'
          }
        ]
      }
    ]

    setTimeout(() => {
      setOrders(mockOrders)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredOrders = orders.filter(order => {
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'active' && ['new', 'preparing'].includes(order.status)) ||
      order.status === statusFilter

    const priorityMatch = priorityFilter === 'all' || order.priority === priorityFilter

    return statusMatch && priorityMatch
  })

  const getTimeElapsed = (startTime: string) => {
    const elapsed = Math.floor((currentTime.getTime() - new Date(startTime).getTime()) / (1000 * 60))
    return elapsed
  }

  const getWaitingTime = (placedAt: string) => {
    const waiting = Math.floor((currentTime.getTime() - new Date(placedAt).getTime()) / (1000 * 60))
    return waiting
  }

  const getOrderColor = (order: KitchenOrder) => {
    const waitingTime = getWaitingTime(order.placedAt)
    const estimatedTime = order.estimatedTime

    if (order.status === 'delayed') return 'border-red-500 bg-red-50'
    if (order.status === 'ready') return 'border-green-500 bg-green-50'
    if (waitingTime > estimatedTime + 5) return 'border-red-400 bg-red-50'
    if (waitingTime > estimatedTime) return 'border-yellow-400 bg-yellow-50'
    if (order.priority === 'high') return 'border-orange-400 bg-orange-50'
    return 'border-blue-400 bg-blue-50'
  }

  const updateOrderStatus = async (orderId: string, status: KitchenOrder['status']) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updates: Partial<KitchenOrder> = { status }
        if (status === 'preparing' && !order.actualStartTime) {
          updates.actualStartTime = new Date().toISOString()
        }
        return { ...order, ...updates }
      }
      return order
    }))

    const statusMessages = {
      preparing: 'Order started preparation',
      ready: 'Order marked as ready',
      delayed: 'Order marked as delayed'
    }

    toast.success(statusMessages[status] || 'Order status updated')
  }

  const priorityConfig = {
    high: { color: 'text-red-600', bg: 'bg-red-100', label: 'High' },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium' },
    low: { color: 'text-green-600', bg: 'bg-green-100', label: 'Low' }
  }

  const statusConfig = {
    new: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Bell, label: 'New' },
    preparing: { color: 'text-orange-600', bg: 'bg-orange-100', icon: Timer, label: 'Preparing' },
    ready: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, label: 'Ready' },
    delayed: { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle, label: 'Delayed' }
  }

  const getOrderTypeIcon = (type: string) => {
    switch (type) {
      case 'dine_in': return Users
      case 'takeaway': return ChefHat
      case 'delivery': return Clock
      default: return ChefHat
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 pb-20 lg:pb-8">
          <div className="container-responsive py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
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
    <RoleGuard allowedRoles={['chef', 'operation_manager', 'admin', 'owner']}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="pt-20 pb-20 lg:pb-8">
          <div className="container-responsive py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <ChefHat className="w-8 h-8 text-brand-red" />
                  Kitchen Dashboard
                </h1>
                <p className="text-gray-600">Manage incoming orders and kitchen queue</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="btn-outline flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="card text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => o.status === 'new').length}
                </div>
                <div className="text-gray-600 text-sm">New Orders</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {orders.filter(o => o.status === 'preparing').length}
                </div>
                <div className="text-gray-600 text-sm">Preparing</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'ready').length}
                </div>
                <div className="text-gray-600 text-sm">Ready</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-bold text-red-600">
                  {orders.filter(o => o.status === 'delayed').length}
                </div>
                <div className="text-gray-600 text-sm">Delayed</div>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                >
                  <option value="active">Active Orders</option>
                  <option value="all">All Orders</option>
                  <option value="new">New</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delayed">Delayed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </motion.div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center py-16"
              >
                <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders to show</h3>
                <p className="text-gray-600">All caught up! New orders will appear here.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order, index) => {
                  const statusInfo = statusConfig[order.status]
                  const StatusIcon = statusInfo.icon
                  const OrderTypeIcon = getOrderTypeIcon(order.orderType)
                  const waitingTime = getWaitingTime(order.placedAt)
                  const elapsedTime = order.actualStartTime ? getTimeElapsed(order.actualStartTime) : 0

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`card border-l-4 ${getOrderColor(order)} hover:shadow-lg transition-all duration-300`}
                    >
                      {/* Order Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${statusInfo.bg} rounded-lg flex items-center justify-center`}>
                            <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">#{order.orderNumber}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <OrderTypeIcon className="w-4 h-4" />
                              {order.tableNumber ? `Table ${order.tableNumber}` : order.orderType}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[order.priority].color} ${priorityConfig[order.priority].bg}`}>
                            {priorityConfig[order.priority].label}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {waitingTime}m waiting
                          </div>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="mb-4">
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                        {order.allergies && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-xs text-red-600">
                              Allergies: {order.allergies.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Items */}
                      <div className="mb-4">
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{item.quantity}x</span>
                                  <span className="text-sm text-gray-900">{item.name}</span>
                                  {item.priority === 'high' && (
                                    <Flame className="w-3 h-3 text-red-500" />
                                  )}
                                </div>
                                {item.customizations.length > 0 && (
                                  <p className="text-xs text-brand-red ml-6">
                                    {item.customizations.join(', ')}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">{item.prepTime}m</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className="mb-4 p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                          <p className="text-xs text-yellow-800">
                            <strong>Note:</strong> {order.notes}
                          </p>
                        </div>
                      )}

                      {/* Timing */}
                      <div className="mb-4 text-xs text-gray-600">
                        <div className="flex items-center justify-between">
                          <span>Est. Time: {order.estimatedTime}m</span>
                          {order.actualStartTime && (
                            <span>Cooking: {elapsedTime}m</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex-1 btn-outline py-2 text-sm flex items-center justify-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        
                        {order.status === 'new' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1"
                          >
                            <Play className="w-4 h-4" />
                            Start
                          </button>
                        )}

                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Ready
                          </button>
                        )}

                        {order.status === 'ready' && (
                          <div className="flex-1 bg-green-100 text-green-800 py-2 rounded-lg text-sm flex items-center justify-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Ready
                          </div>
                        )}
                      </div>

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delayed')}
                          className="w-full mt-2 text-red-600 hover:text-red-700 text-xs"
                        >
                          Mark as Delayed
                        </button>
                      )}
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
                className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Order #{selectedOrder.orderNumber}
                      </h2>
                      <p className="text-gray-600">{selectedOrder.customerName}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  {/* Detailed order information would go here */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="border-b border-gray-100 pb-2 mb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium">{item.quantity}x {item.name}</span>
                              {item.customizations.length > 0 && (
                                <p className="text-sm text-brand-red">
                                  {item.customizations.join(', ')}
                                </p>
                              )}
                            </div>
                            <span className="text-sm text-gray-600">{item.prepTime}m</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedOrder.notes && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Special Notes</h3>
                        <p className="text-gray-600 bg-yellow-50 p-3 rounded">{selectedOrder.notes}</p>
                      </div>
                    )}

                    {selectedOrder.allergies && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-red-700">Allergies</h3>
                        <p className="text-red-600 bg-red-50 p-3 rounded">
                          {selectedOrder.allergies.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="w-full btn-primary"
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

export default KitchenDashboard
