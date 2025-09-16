'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Mail,
  ShoppingCart,
  Truck,
  Store,
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { chapaService } from '@/services/chapaService'
import Header from '@/components/layout/Header'
import MobileNavigation from '@/components/layout/MobileNavigation'
import RoleGuard from '@/components/auth/RoleGuard'

interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
  customizations?: string[]
  image?: string
}

interface DeliveryInfo {
  type: 'delivery' | 'pickup'
  address?: string
  landmark?: string
  phone: string
  notes?: string
  preferredTime?: string
}

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    type: 'delivery',
    phone: ''
  })
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [newOrderId, setNewOrderId] = useState('')

  const { user } = useAuth()
  const router = useRouter()

  // Mock cart items (in real app, this would come from cart context)
  useEffect(() => {
    const mockCartItems: CartItem[] = [
      {
        id: '1',
        name: 'keol Special Burger',
        quantity: 2,
        price: 450,
        customizations: ['Extra cheese', 'No pickles']
      },
      {
        id: '2',
        name: 'Margherita Pizza',
        quantity: 1,
        price: 380
      },
      {
        id: '3',
        name: 'Ethiopian Coffee',
        quantity: 2,
        price: 80
      }
    ]

    setCartItems(mockCartItems)

    // Pre-fill customer info if user is logged in
    if (user) {
      setCustomerInfo({
        name: user.name || '',
        email: '',
        phone: user.phoneNumber || ''
      })
      setDeliveryInfo(prev => ({
        ...prev,
        phone: user.phoneNumber || ''
      }))
    }
  }, [user])

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = deliveryInfo.type === 'delivery' ? 50 : 0
  const serviceFee = Math.round(subtotal * 0.05) // 5% service fee
  const total = subtotal + deliveryFee + serviceFee

  const paymentMethods = chapaService.getSupportedMethods()

  const handleInputChange = (section: 'customer' | 'delivery', field: string, value: string) => {
    if (section === 'customer') {
      setCustomerInfo(prev => ({ ...prev, [field]: value }))
    } else {
      setDeliveryInfo(prev => ({ ...prev, [field]: value }))
    }
  }

  const validateForm = (): boolean => {
    if (!customerInfo.name.trim()) {
      toast.error('Please enter your name')
      return false
    }

    if (!customerInfo.phone.trim()) {
      toast.error('Please enter your phone number')
      return false
    }

    if (deliveryInfo.type === 'delivery' && !deliveryInfo.address?.trim()) {
      toast.error('Please enter delivery address')
      return false
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return false
    }

    return true
  }

  const processPayment = async () => {
    if (!validateForm()) return

    setIsProcessing(true)

    try {
      // Create order first
      const orderId = `KBP-${Date.now()}`
      
      // Prepare payment data
      const paymentData = chapaService.createOrderPayment({
        orderId,
        amount: total,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email || `${customerInfo.phone}@temp.com`,
        customerPhone: customerInfo.phone,
        items: cartItems
      })

      // In development, use mock payment
      if (process.env.NODE_ENV === 'development') {
        const result = await chapaService.mockPayment(total, customerInfo)
        
        if (result.success) {
          // Simulate order creation
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          setNewOrderId(orderId)
          setOrderPlaced(true)
          toast.success('Order placed successfully!')
          
          // Clear cart (in real app, this would be done through cart context)
          setTimeout(() => {
            router.push(`/orders`)
          }, 3000)
        } else {
          throw new Error('Payment failed')
        }
      } else {
        // Production payment flow
        const paymentResponse = await chapaService.initializePayment(paymentData)
        
        if (paymentResponse.status === 'success') {
          // Redirect to Chapa checkout
          window.location.href = paymentResponse.data.checkout_url
        } else {
          throw new Error('Payment initialization failed')
        }
      }

    } catch (error) {
      console.error('Payment processing failed:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
      setShowPaymentModal(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full mx-4"
        >
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your order #{newOrderId} has been confirmed and is being prepared.
            </p>
            <div className="space-y-3">
              <Link href="/orders" className="w-full btn-primary">
                View Order Status
              </Link>
              <Link href="/menu" className="w-full btn-outline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>
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
              className="flex items-center gap-4 mb-8"
            >
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                <p className="text-gray-600">Review and place your order</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Customer Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="card"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <User className="w-6 h-6 text-brand-red" />
                    <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => handleInputChange('customer', 'name', e.target.value)}
                        className="input-field"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => handleInputChange('customer', 'phone', e.target.value)}
                        className="input-field"
                        placeholder="+251 91 123 4567"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => handleInputChange('customer', 'email', e.target.value)}
                        className="input-field"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Delivery Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Truck className="w-6 h-6 text-brand-red" />
                    <h2 className="text-xl font-semibold text-gray-900">Delivery Information</h2>
                  </div>

                  {/* Delivery Type */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      onClick={() => setDeliveryInfo(prev => ({ ...prev, type: 'delivery' }))}
                      className={`p-4 rounded-lg border-2 text-center transition-colors ${
                        deliveryInfo.type === 'delivery'
                          ? 'border-brand-red bg-red-50 text-brand-red'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Truck className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-medium">Delivery</span>
                      <p className="text-sm text-gray-600">50 ETB</p>
                    </button>
                    <button
                      onClick={() => setDeliveryInfo(prev => ({ ...prev, type: 'pickup' }))}
                      className={`p-4 rounded-lg border-2 text-center transition-colors ${
                        deliveryInfo.type === 'pickup'
                          ? 'border-brand-red bg-red-50 text-brand-red'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Store className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-medium">Pickup</span>
                      <p className="text-sm text-gray-600">Free</p>
                    </button>
                  </div>

                  {deliveryInfo.type === 'delivery' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Address *
                        </label>
                        <input
                          type="text"
                          value={deliveryInfo.address || ''}
                          onChange={(e) => handleInputChange('delivery', 'address', e.target.value)}
                          className="input-field"
                          placeholder="Enter your full address"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          value={deliveryInfo.landmark || ''}
                          onChange={(e) => handleInputChange('delivery', 'landmark', e.target.value)}
                          className="input-field"
                          placeholder="Near hotel, church, etc."
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={deliveryInfo.notes || ''}
                      onChange={(e) => handleInputChange('delivery', 'notes', e.target.value)}
                      className="input-field resize-none"
                      rows={3}
                      placeholder="Any special instructions for delivery..."
                    />
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-brand-red" />
                    <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                          paymentMethod === method.id
                            ? 'border-brand-red bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{method.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900">{method.name}</div>
                              <div className="text-sm text-gray-600">{method.description}</div>
                            </div>
                          </div>
                          {method.fees && (
                            <span className="text-xs text-gray-500">{method.fees}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <strong>Secure Payment:</strong> Your payment information is encrypted and secured by Chapa.
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="card sticky top-24"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <ShoppingCart className="w-6 h-6 text-brand-red" />
                    <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-yellow to-brand-red rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {item.quantity}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          {item.customizations && item.customizations.length > 0 && (
                            <p className="text-xs text-brand-red">
                              {item.customizations.join(', ')}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            {item.quantity} × {item.price} ETB
                          </p>
                        </div>
                        <span className="font-medium text-gray-900">
                          {item.price * item.quantity} ETB
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{subtotal} ETB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Service Fee (5%)</span>
                      <span className="text-gray-900">{serviceFee} ETB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {deliveryInfo.type === 'delivery' ? 'Delivery Fee' : 'Pickup'}
                      </span>
                      <span className="text-gray-900">{deliveryFee} ETB</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span className="text-brand-red">{total} ETB</span>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Time */}
                  <div className="mt-6 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">Estimated Time</div>
                      <div className="text-gray-600">
                        {deliveryInfo.type === 'delivery' ? '25-35 minutes' : '15-20 minutes'}
                      </div>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={isProcessing}
                    className="w-full btn-primary mt-6 py-4 text-lg flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Place Order - {total} ETB
                      </>
                    )}
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Confirmation Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowPaymentModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl max-w-md w-full p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Payment</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-semibold">{total} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-semibold">
                      {paymentMethods.find(m => m.id === paymentMethod)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer</span>
                    <span className="font-semibold">{customerInfo.name}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 btn-outline"
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={isProcessing}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                  </button>
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

export default CheckoutPage
