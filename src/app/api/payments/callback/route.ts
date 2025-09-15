import { NextRequest, NextResponse } from 'next/server'
import { chapaService } from '@/services/chapaService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Chapa sends payment status via webhook
    const { tx_ref, status, amount, customer } = body
    
    if (!tx_ref) {
      return NextResponse.json(
        { message: 'Transaction reference is required' },
        { status: 400 }
      )
    }

    // Verify the payment with Chapa
    const verification = await chapaService.verifyPayment(tx_ref)
    
    if (verification.status === 'success' && verification.data.status === 'success') {
      // Payment successful - update order status
      await updateOrderStatus(tx_ref, 'paid', verification.data)
      
      // Send confirmation notifications
      await sendPaymentConfirmation(verification.data)
      
      return NextResponse.json({
        message: 'Payment verified successfully',
        status: 'success'
      })
    } else {
      // Payment failed
      await updateOrderStatus(tx_ref, 'failed', verification.data)
      
      return NextResponse.json({
        message: 'Payment verification failed',
        status: 'failed'
      })
    }
    
  } catch (error) {
    console.error('Payment callback error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateOrderStatus(txRef: string, status: 'paid' | 'failed', paymentData: any) {
  try {
    // In a real application, this would update the database
    console.log(`Updating order status for tx_ref: ${txRef} to ${status}`)
    
    // Mock order update
    const orderUpdate = {
      txRef,
      status,
      paymentData: {
        amount: paymentData.amount,
        currency: paymentData.currency,
        chargedAmount: paymentData.charge,
        paymentMethod: paymentData.method || 'unknown',
        paidAt: paymentData.created_at,
        chapaReference: paymentData.trx_ref
      },
      updatedAt: new Date().toISOString()
    }
    
    // Store in database (implementation depends on your database choice)
    // await database.orders.update({ txRef }, orderUpdate)
    
    return orderUpdate
  } catch (error) {
    console.error('Failed to update order status:', error)
    throw error
  }
}

async function sendPaymentConfirmation(paymentData: any) {
  try {
    // Send email/SMS confirmation
    const confirmationData = {
      customerEmail: paymentData.email,
      customerPhone: paymentData.phone_number,
      amount: paymentData.amount,
      txRef: paymentData.tx_ref,
      paidAt: paymentData.created_at
    }
    
    // In a real app, integrate with email/SMS service
    console.log('Sending payment confirmation:', confirmationData)
    
    // Mock notification sending
    // await emailService.sendPaymentConfirmation(confirmationData)
    // await smsService.sendPaymentConfirmation(confirmationData)
    
  } catch (error) {
    console.error('Failed to send payment confirmation:', error)
    // Don't throw error as payment is already successful
  }
}
