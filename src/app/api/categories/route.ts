import { NextRequest, NextResponse } from 'next/server'
import { menuService } from '@/services/menuService'

export async function GET(request: NextRequest) {
  try {
    const categories = await menuService.getCategories()
    
    return NextResponse.json({
      success: true,
      data: categories
    })

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
