'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Package, 
  ChefHat, 
  Truck, 
  CheckCircle, 
  Clock,
  MapPin,
  Phone,
  Star,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface OrderStatus {
  id: string
  status: 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
  timestamp: string
  description: string
}

interface Order {
  id: string
  orderNumber: string
  status: OrderStatus['status']
  placedAt: string
  estimatedDelivery: string
  actualDelivery?: string
  customer: {
    name: string
    phone: string
    address: string
  }
  restaurant: {
    name: string
    address: string
    phone: string
  }
  driver?: {
    name: string
    phone: string
    vehicle: string
    rating: number
  }
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  timeline: OrderStatus[]
}

const TrackOrderPage = () => {
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Sample order data for demonstration
  const sampleOrder: Order = {
    id: '1',
    orderNumber: 'KBP-2024-0123',
    status: 'out_for_delivery',
    placedAt: '2024-01-15T14:30:00Z',
    estimatedDelivery: '2024-01-15T15:15:00Z',
    customer: {
      name: 'John Doe',
      phone: '+251-911-123456',
      address: 'Bole, Addis Ababa, Near Friendship City Center'
    },
    restaurant: {
      name: 'keol - Bole Branch',
      address: 'Bole Road, Near Edna Mall',
      phone: '+251-911-123456'
    },
    driver: {
      name: 'Ahmed Hassan',
      phone: '+251-912-345678',
      vehicle: 'Blue Bajaj - AA-3-12345',
      rating: 4.8
    },
    items: [
      { name: 'keol Special Burger', quantity: 2, price: 450 },
      { name: 'Margherita Pizza', quantity: 1, price: 380 },
      { name: 'Ethiopian Coffee', quantity: 2, price: 80 }
    ],
    total: 1440,
    timeline: [
      {
        id: '1',
        status: 'confirmed',
        timestamp: '2024-01-15T14:30:00Z',
        description: 'Order confirmed and sent to kitchen'
      },
      {
        id: '2',
        status: 'preparing',
        timestamp: '2024-01-15T14:35:00Z',
        description: 'Kitchen started preparing your order'
      },
      {
        id: '3',
        status: 'ready',
        timestamp: '2024-01-15T14:55:00Z',
        description: 'Order ready for pickup'
      },
      {
        id: '4',
        status: 'out_for_delivery',
        timestamp: '2024-01-15T15:00:00Z',
        description: 'Out for delivery with Ahmed Hassan'
      }
    ]
  }

  const statusConfig = {
    confirmed: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      title: 'Order Confirmed',
      description: 'Your order has been confirmed'
    },
    preparing: {
      icon: ChefHat,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      title: 'Preparing',
      description: 'Kitchen is preparing your order'
    },
    ready: {
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      title: 'Ready for Pickup',
      description: 'Order is ready and waiting for delivery'
    },
    out_for_delivery: {
      icon: Truck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      title: 'Out for Delivery',
      description: 'Driver is on the way to your location'
    },
    delivered: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      title: 'Delivered',
      description: 'Order has been successfully delivered'
    },
    cancelled: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      title: 'Cancelled',
      description: 'Order has been cancelled'
    }
  }

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) {
      toast.error('Please enter an order number')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // For demo purposes, use sample order if order number matches
      if (orderNumber.toUpperCase() === 'KBP-2024-0123' || orderNumber === '123') {
        setOrder(sampleOrder)
      } else {
        setError('Order not found. Please check your order number.')
        setOrder(null)
      }
    } catch (error) {
      toast.error('Failed to track order. Please try again.')
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshOrder = async () => {
    if (!order) return
    
    setIsLoading(true)
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Order status updated')
    } catch (error) {
      toast.error('Failed to refresh order status')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEstimatedTime = (estimatedDelivery: string) => {
    const now = new Date()
    const estimated = new Date(estimatedDelivery)
    const diffMinutes = Math.max(0, Math.ceil((estimated.getTime() - now.getTime()) / (1000 * 60)))
    
    if (diffMinutes === 0) return 'Any moment now'
    if (diffMinutes < 60) return `${diffMinutes} min`
    const hours = Math.floor(diffMinutes / 60)
    const mins = diffMinutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-brand-red to-brand-black text-white py-16">
          <div className="container-responsive text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Track Your Order</h1>
              <p className="text-xl mb-8 opacity-90">
                Real-time updates on your delicious meal
              </p>
            </motion.div>
          </div>
        </section>

        <div className="container-responsive py-8">
          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-8"
          >
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Enter Your Order Number
              </h2>
              <form onSubmit={handleTrackOrder} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g., KBP-2024-0123"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="loading-spinner w-5 h-5"></div>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Track Order
                    </>
                  )}
                </button>
              </form>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Demo:</strong> Try order number "KBP-2024-0123" or "123"
                </p>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto mb-8"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Details */}
          <AnimatePresence>
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                {/* Order Header */}
                <div className="card">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Order #{order.orderNumber}
                      </h2>
                      <p className="text-gray-600">
                        Placed on {formatDate(order.placedAt)} at {formatTime(order.placedAt)}
                      </p>
                    </div>
                    <button
                      onClick={refreshOrder}
                      disabled={isLoading}
                      className="btn-outline flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>

                  {/* Current Status */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {(() => {
                        const StatusIcon = statusConfig[order.status].icon
                        return (
                          <div className={`w-12 h-12 ${statusConfig[order.status].bgColor} rounded-full flex items-center justify-center`}>
                            <StatusIcon className={`w-6 h-6 ${statusConfig[order.status].color}`} />
                          </div>
                        )
                      })()}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {statusConfig[order.status].title}
                        </h3>
                        <p className="text-gray-600">
                          {statusConfig[order.status].description}
                        </p>
                      </div>
                    </div>

                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          Estimated delivery: {getEstimatedTime(order.estimatedDelivery)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Order Timeline */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h3>
                    <div className="space-y-4">
                      {order.timeline.map((status, index) => {
                        const StatusIcon = statusConfig[status.status].icon
                        const isActive = index === order.timeline.length - 1
                        
                        return (
                          <div key={status.id} className="flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isActive 
                                ? statusConfig[status.status].bgColor 
                                : 'bg-gray-100'
                            }`}>
                              <StatusIcon className={`w-4 h-4 ${
                                isActive 
                                  ? statusConfig[status.status].color 
                                  : 'text-gray-400'
                              }`} />
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-medium ${
                                  isActive ? 'text-gray-900' : 'text-gray-600'
                                }`}>
                                  {statusConfig[status.status].title}
                                </h4>
                                <span className="text-sm text-gray-500">
                                  {formatTime(status.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {status.description}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h3>
                    <div className="space-y-4 mb-6">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-medium text-gray-900">
                            {item.price * item.quantity} ETB
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span className="text-brand-red">{order.total} ETB</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Customer Info */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-brand-red mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{order.customer.name}</p>
                          <p className="text-gray-600">{order.customer.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-brand-red" />
                        <a 
                          href={`tel:${order.customer.phone}`}
                          className="text-gray-600 hover:text-brand-red"
                        >
                          {order.customer.phone}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Driver Info */}
                  {order.driver && (
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Partner</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{order.driver.name}</p>
                            <p className="text-sm text-gray-600">{order.driver.vehicle}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{order.driver.rating}</span>
                          </div>
                        </div>
                        <a
                          href={`tel:${order.driver.phone}`}
                          className="flex items-center gap-2 btn-outline w-full justify-center"
                        >
                          <Phone className="w-4 h-4" />
                          Call Driver
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {order.status === 'delivered' && (
                  <div className="card text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      How was your experience?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Your feedback helps us improve our service
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button className="btn-primary">Rate Your Order</button>
                      <button className="btn-outline">Order Again</button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default TrackOrderPage
