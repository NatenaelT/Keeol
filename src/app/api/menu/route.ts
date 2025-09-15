import { NextRequest, NextResponse } from 'next/server'
import { menuService } from '@/services/menuService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      categoryId: searchParams.get('category') || undefined,
      isPopular: searchParams.get('popular') === 'true' || undefined,
      isVegetarian: searchParams.get('vegetarian') === 'true' || undefined,
      isSpicy: searchParams.get('spicy') === 'true' || undefined,
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined
    }

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters]
      }
    })

    const menuItems = await menuService.getMenuItems(filters)
    
    return NextResponse.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    })

  } catch (error) {
    console.error('Get menu items error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch menu items',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Admin only - Create menu item
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication middleware
    const body = await request.json()
    
    const menuItem = await menuService.createMenuItem(body)
    
    if (menuItem) {
      return NextResponse.json({
        success: true,
        data: menuItem,
        message: 'Menu item created successfully'
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          message: 'Failed to create menu item'
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Create menu item error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to create menu item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
