import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data for recent users - in production this would query the database
    const mockRecentUsers = [
      {
        id: '1a6af62e-e67c-49ef-9c61-11d5a042ac03',
        name: 'Natenael Teketel (Admin)',
        email: 'admin@keeolburger.com',
        phone_number: '+251917911604',
        role: 'admin',
        loyalty_tier: 'Platinum',
        loyalty_points: 2500,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        total_orders: 0,
        total_spent: 0
      },
      {
        id: '2b7bf73f-f78d-5aef-b72b-22e6b153bd14',
        name: 'Kidus Alemayehu',
        email: 'kidus@email.com',
        phone_number: '+251911234567',
        role: 'customer',
        loyalty_tier: 'Gold',
        loyalty_points: 1850,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        last_login: new Date(Date.now() - 3600000).toISOString(),
        total_orders: 15,
        total_spent: 6750
      },
      {
        id: '3c8cf84g-g89e-6bfg-c83c-33f7c264ce25',
        name: 'Hanan Mohammed',
        phone_number: '+251922345678',
        role: 'customer',
        loyalty_tier: 'Silver',
        loyalty_points: 1200,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        last_login: new Date(Date.now() - 7200000).toISOString(),
        total_orders: 8,
        total_spent: 3520
      },
      {
        id: '4d9df95h-h9af-7cgh-d94d-44g8d375df36',
        name: 'Dawit Gebre',
        email: 'dawit.g@email.com',
        phone_number: '+251933456789',
        role: 'customer',
        loyalty_tier: 'Bronze',
        loyalty_points: 650,
        created_at: new Date(Date.now() - 259200000).toISOString(),
        last_login: new Date(Date.now() - 14400000).toISOString(),
        total_orders: 4,
        total_spent: 1800
      },
      {
        id: '5eaea06i-iabg-8dhi-ea5e-55h9e486eg47',
        name: 'Sara Bekele',
        phone_number: '+251944567890',
        role: 'customer',
        loyalty_tier: 'Bronze',
        loyalty_points: 350,
        created_at: new Date(Date.now() - 345600000).toISOString(),
        last_login: new Date(Date.now() - 21600000).toISOString(),
        total_orders: 2,
        total_spent: 890
      },
      {
        id: '6fbfb17j-jbch-9eij-fb6f-66iaf597fh58',
        name: 'Meron Tadesse',
        email: 'meron.t@email.com',
        phone_number: '+251955678901',
        role: 'waiter',
        loyalty_tier: 'Silver',
        loyalty_points: 950,
        created_at: new Date(Date.now() - 432000000).toISOString(),
        last_login: new Date(Date.now() - 28800000).toISOString(),
        total_orders: 6,
        total_spent: 2650
      }
    ]

    return NextResponse.json({
      users: mockRecentUsers,
      total: mockRecentUsers.length
    })

  } catch (error) {
    console.error('Recent users error:', error)
    
    return NextResponse.json({
      users: [],
      total: 0
    })
  }
}
