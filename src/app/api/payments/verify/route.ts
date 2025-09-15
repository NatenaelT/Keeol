import { NextRequest, NextResponse } from 'next/server'
import { chapaService } from '@/services/chapaService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const txRef = searchParams.get('tx_ref')
    
    if (!txRef) {
      return NextResponse.json(
        { message: 'Transaction reference is required' },
        { status: 400 }
      )
    }

    // Verify payment with Chapa
    const verification = await chapaService.verifyPayment(txRef)
    
    return NextResponse.json({
      success: verification.status === 'success',
      data: verification.data,
      message: verification.message
    })
    
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to verify payment',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { txRef } = await request.json()
    
    if (!txRef) {
      return NextResponse.json(
        { message: 'Transaction reference is required' },
        { status: 400 }
      )
    }

    // Get payment status
    const status = await chapaService.getPaymentStatus(txRef)
    
    return NextResponse.json({
      txRef,
      status,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { 
        message: 'Failed to check payment status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
