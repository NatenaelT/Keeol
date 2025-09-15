import { NextRequest, NextResponse } from 'next/server'
import { mcp__supabase__execute_sql } from '@/lib/supabase-mcp'

export async function GET(request: NextRequest) {
  try {
    // Get user statistics
    const userStatsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as new_users_today,
        COUNT(CASE WHEN last_login > NOW() - INTERVAL '7 days' THEN 1 END) as active_users,
        COUNT(CASE WHEN loyalty_tier = 'Bronze' THEN 1 END) as bronze_users,
        COUNT(CASE WHEN loyalty_tier = 'Silver' THEN 1 END) as silver_users,
        COUNT(CASE WHEN loyalty_tier = 'Gold' THEN 1 END) as gold_users,
        COUNT(CASE WHEN loyalty_tier = 'Platinum' THEN 1 END) as platinum_users
      FROM users 
      WHERE is_active = true;
    `

    const result = await fetch('/api/supabase/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userStatsQuery })
    })

    if (!result.ok) {
      // Fallback data if database query fails
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

    const data = await result.json()
    const stats = data.rows?.[0] || {}

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
