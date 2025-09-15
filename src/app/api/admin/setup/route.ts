import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const adminPhone = '0917911604'
    const adminPassword = 'Alephtav@2025'
    
    // Check if admin already exists
    let adminUser = await authService.findUserByPhone(adminPhone)
    
    if (!adminUser) {
      // Create admin user
      adminUser = await authService.createUser({
        phoneNumber: adminPhone,
        name: 'Natenael Teketel (Admin)',
        role: 'admin',
        email: 'admin@keeolburger.com'
      })
      
      console.log('Admin user created:', adminUser.id)
    } else {
      // Update to admin role if not already
      if (adminUser.role !== 'admin') {
        await authService.updateUser(adminUser.id, {
          role: 'admin',
          name: 'Natenael Teketel (Admin)',
          permissions: ['*'] // All permissions
        })
        console.log('User upgraded to admin:', adminUser.id)
      }
    }

    // For this simplified version, we're storing password in env or skipping password auth
    // In production, you'd want proper password hashing and storage
    
    return NextResponse.json({
      success: true,
      message: 'Admin user setup completed',
      admin: {
        id: adminUser.id,
        name: adminUser.name,
        phone: adminUser.phoneNumber,
        role: adminUser.role
      }
    })

  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { success: false, message: 'Admin setup failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const adminPhone = '0917911604'
    const adminUser = await authService.findUserByPhone(adminPhone)
    
    return NextResponse.json({
      adminExists: !!adminUser,
      admin: adminUser ? {
        id: adminUser.id,
        name: adminUser.name,
        phone: adminUser.phoneNumber,
        role: adminUser.role
      } : null
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check admin status' }, { status: 500 })
  }
}
