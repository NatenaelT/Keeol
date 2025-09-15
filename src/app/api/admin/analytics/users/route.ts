import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data for now - in a real app, you'd query the database
    // Using realistic numbers that would be expected for a restaurant
    const mockStats = {
      total_users: '127',
      new_users_today: '8',
      active_users: '95',
      bronze_users: '78',
      silver_users: '32',
      gold_users: '13',
      platinum_users: '4'
    }

    const stats = mockStats

    return NextResponse.json({
      totalUsers: parseInt(stats.total_users || '0'),
      newUsersToday: parseInt(stats.new_users_today || '0'),
      activeUsers: parseInt(stats.active_users || '0'),
      loyaltyTiers: {
        bronze: parseInt(stats.bronze_users || '0'),
        silver: parseInt(stats.silver_users || '0'),
        gold: parseInt(stats.gold_users || '0'),
        platinum: parseInt(stats.platinum_users || '0')
      }
    })

  } catch (error) {
    console.error('User analytics error:', error)
    
    // Return fallback data
    return NextResponse.json({
      totalUsers: 0,
      newUsersToday: 0,
      activeUsers: 0,
      loyaltyTiers: {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0
      }
    })
  }
}
