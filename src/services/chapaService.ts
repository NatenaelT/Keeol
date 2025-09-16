import axios from 'axios'

interface ChapaPaymentRequest {
  amount: number
  currency: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
  tx_ref: string
  callback_url: string
  return_url: string
  customization?: {
    title?: string
    description?: string
    logo?: string
  }
}

interface ChapaPaymentResponse {
  message: string
  status: string
  data: {
    checkout_url: string
  }
}

interface ChapaVerificationResponse {
  message: string
  status: string
  data: {
    amount: number
    currency: string
    email: string
    first_name: string
    last_name: string
    phone_number: string
    status: 'success' | 'failed' | 'pending'
    tx_ref: string
    charge: number
    meta: any
    created_at: string
    updated_at: string
  }
}

class ChapaPaymentService {
  private readonly baseURL = 'https://api.chapa.co/v1'
  private readonly secretKey: string

  constructor() {
    this.secretKey = process.env.NEXT_PUBLIC_CHAPA_SECRET_KEY || process.env.CHAPA_SECRET_KEY || ''
    
    if (!this.secretKey) {
      console.warn('Chapa secret key not found. Payment functionality will be limited.')
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    }
  }

  /**
   * Initialize a new payment
   */
  async initializePayment(paymentData: ChapaPaymentRequest): Promise<ChapaPaymentResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        paymentData,
        { headers: this.getHeaders() }
      )

      return response.data
    } catch (error) {
      console.error('Chapa payment initialization failed:', error)
      throw new Error('Failed to initialize payment')
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(txRef: string): Promise<ChapaVerificationResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${txRef}`,
        { headers: this.getHeaders() }
      )

      return response.data
    } catch (error) {
      console.error('Chapa payment verification failed:', error)
      throw new Error('Failed to verify payment')
    }
  }

  /**
   * Generate a unique transaction reference
   */
  generateTxRef(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `KBP_${timestamp}_${random}`
  }

  /**
   * Create payment request for order
   */
  createOrderPayment(orderData: {
    orderId: string
    amount: number
    customerName: string
    customerEmail: string
    customerPhone: string
    items: Array<{ name: string; quantity: number; price: number }>
  }) {
    const txRef = this.generateTxRef()
    const [firstName, ...lastNameParts] = orderData.customerName.split(' ')
    const lastName = lastNameParts.join(' ') || firstName

    const paymentRequest: ChapaPaymentRequest = {
      amount: orderData.amount,
      currency: 'ETB',
      email: orderData.customerEmail,
      first_name: firstName,
      last_name: lastName,
      phone_number: orderData.customerPhone,
      tx_ref: txRef,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderData.orderId}?payment=success`,
      customization: {
        title: 'keol',
        description: `Payment for Order #${orderData.orderId}`,
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
      }
    }

    return paymentRequest
  }

  /**
   * Mock payment for development
   */
  async mockPayment(amount: number, customerData: any): Promise<{ success: boolean; txRef: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const txRef = this.generateTxRef()
    
    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1
    
    return { success, txRef }
  }

  /**
   * Get payment status for order tracking
   */
  async getPaymentStatus(txRef: string): Promise<'pending' | 'success' | 'failed'> {
    try {
      const verification = await this.verifyPayment(txRef)
      return verification.data.status
    } catch (error) {
      return 'failed'
    }
  }

  /**
   * Calculate total with fees
   */
  calculateTotal(subtotal: number, deliveryFee: number = 0, serviceFee: number = 0): {
    subtotal: number
    deliveryFee: number
    serviceFee: number
    total: number
  } {
    const total = subtotal + deliveryFee + serviceFee
    
    return {
      subtotal,
      deliveryFee,
      serviceFee,
      total
    }
  }

  /**
   * Format Ethiopian Birr amount
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  /**
   * Validate payment amount
   */
  validateAmount(amount: number): boolean {
    return amount > 0 && amount <= 1000000 // Max 1M ETB
  }

  /**
   * Get supported payment methods
   */
  getSupportedMethods(): Array<{
    id: string
    name: string
    description: string
    icon: string
    fees?: string
  }> {
    return [
      {
        id: 'telebirr',
        name: 'TeleBirr',
        description: 'Pay with TeleBirr mobile wallet',
        icon: '📱',
        fees: 'No additional fees'
      },
      {
        id: 'cbe',
        name: 'CBE Birr',
        description: 'Commercial Bank of Ethiopia',
        icon: '🏪',
        fees: 'Bank charges may apply'
      },
      {
        id: 'awash',
        name: 'Awash Bank',
        description: 'Pay through Awash Bank',
        icon: '🏦',
        fees: 'Bank charges may apply'
      },
      {
        id: 'abyssinia',
        name: 'Bank of Abyssinia',
        description: 'Pay through Bank of Abyssinia',
        icon: '🏛️',
        fees: 'Bank charges may apply'
      }
    ]
  }
}

export const chapaService = new ChapaPaymentService()
export default chapaService
