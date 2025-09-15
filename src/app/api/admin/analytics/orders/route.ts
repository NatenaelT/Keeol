import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data for orders analytics
    const mockOrderStats = {
      total_orders: '2847',
      today_orders: '23',
      total_revenue: '1247850',
      today_revenue: '12450',
      avg_order_value: '438'
    }

    const stats = mockOrderStats

    return NextResponse.json({
      totalOrders: parseInt(stats.total_orders || '0'),
      todayOrders: parseInt(stats.today_orders || '0'),
      totalRevenue: parseFloat(stats.total_revenue || '0'),
      todayRevenue: parseFloat(stats.today_revenue || '0'),
      averageOrderValue: parseFloat(stats.avg_order_value || '0')
    })

  } catch (error) {
    console.error('Order analytics error:', error)
    
    return NextResponse.json({
      totalOrders: 0,
      todayOrders: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      averageOrderValue: 0
    })
  }
}
