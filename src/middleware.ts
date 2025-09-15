import { NextRequest, NextResponse } from 'next/server'

// Define route permissions for each role
const routePermissions: Record<string, string[]> = {
  // Public routes - no authentication required
  '/': ['*'],
  '/about': ['*'],
  '/contact': ['*'],
  '/menu': ['*'],
  '/login': ['*'],
  '/register': ['*'],
  '/auth': ['*'],
  
  // Customer routes
  '/profile': ['customer', 'waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner'],
  '/orders': ['customer', 'waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner'],
  '/track': ['customer', 'waiter', 'delivery', 'operation_manager', 'admin', 'owner'],
  '/loyalty': ['customer', 'waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner'],
  '/checkout': ['customer'],
  '/payment': ['customer'],
  '/settings': ['customer', 'waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner'],
  
  // Staff routes
  '/staff': ['waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner'],
  '/staff/kitchen': ['chef', 'operation_manager', 'admin', 'owner'],
  '/staff/delivery': ['delivery', 'operation_manager', 'admin', 'owner'],
  '/staff/tables': ['waiter', 'operation_manager', 'admin', 'owner'],
  
  // Management routes
  '/dashboard': ['operation_manager', 'admin', 'owner'],
  '/dashboard/crm': ['operation_manager', 'admin', 'owner'],
  '/dashboard/analytics': ['operation_manager', 'admin', 'owner'],
  '/dashboard/inventory': ['operation_manager', 'admin', 'owner'],
  '/dashboard/staff': ['admin', 'owner'],
  '/dashboard/settings': ['admin', 'owner'],
  
  // Admin routes
  '/admin': ['admin', 'owner'],
  '/admin/users': ['admin', 'owner'],
  '/admin/roles': ['admin', 'owner'],
  '/admin/cms': ['admin', 'owner'],
  '/admin/system': ['owner'],
  
  // API routes
  '/api/auth': ['*'],
  '/api/menu': ['*'],
  '/api/orders': ['customer', 'waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner'],
  '/api/admin': ['admin', 'owner'],
  '/api/staff': ['waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner'],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if route requires authentication
  const requiredRoles = getRequiredRoles(pathname)
  
  // Allow public routes
  if (requiredRoles.includes('*')) {
    return NextResponse.next()
  }
  
  // Get token from cookie or Authorization header
  const token = getTokenFromRequest(request)
  
  if (!token) {
    return redirectToLogin(request)
  }
  
  try {
    // Decode our simplified token format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.log('Invalid token format:', token.substring(0, 50) + '...')
      return redirectToLogin(request)
    }

    let payload
    try {
      payload = JSON.parse(atob(parts[1]))
    } catch (e) {
      console.log('Failed to parse token payload')
      return redirectToLogin(request)
    }

    const userRole = payload.role
    if (!userRole) {
      console.log('Token missing role')
      return redirectToLogin(request)
    }

    // Basic token validation - check if it's not too old (24 hours)
    const tokenAge = Date.now() - (payload.iat || 0)
    if (tokenAge > 24 * 60 * 60 * 1000) {
      console.log('Token expired')
      return redirectToLogin(request)
    }

    // Check if user has required role
    if (!requiredRoles.includes(userRole)) {
      console.log(`Access denied. User role: ${userRole}, Required: ${requiredRoles.join(', ')}`)
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId || '')
    requestHeaders.set('x-user-role', payload.role || '')
    requestHeaders.set('x-phone-number', payload.phoneNumber || '')
    requestHeaders.set('x-telegram-id', payload.telegramId || '')

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    // Invalid token
    console.log('Middleware error:', error)
    return redirectToLogin(request)
  }
}

function getRequiredRoles(pathname: string): string[] {
  // Check exact match first
  if (routePermissions[pathname]) {
    return routePermissions[pathname]
  }
  
  // Check for dynamic routes and prefixes
  for (const route in routePermissions) {
    if (pathname.startsWith(route + '/') || (route.includes('[') && matchesDynamicRoute(pathname, route))) {
      return routePermissions[route]
    }
  }
  
  // Default to requiring authentication for unknown routes
  return ['customer', 'waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner']
}

function matchesDynamicRoute(pathname: string, route: string): boolean {
  const routePattern = route.replace(/\[.*?\]/g, '[^/]+')
  const regex = new RegExp(`^${routePattern}$`)
  return regex.test(pathname)
}

function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Try to get token from cookie
  const tokenCookie = request.cookies.get('auth_token')
  if (tokenCookie) {
    return tokenCookie.value
  }
  
  return null
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/auth', request.url)
  loginUrl.searchParams.set('mode', 'signin')
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
