import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Define route permissions for each role
const routePermissions: Record<string, string[]> = {
  // Public routes - no authentication required
  '/': ['*'],
  '/about': ['*'],
  '/contact': ['*'],
  '/menu': ['*'],
  '/login': ['*'],
  '/register': ['*'],
  
  // Customer routes
  '/profile': ['customer', 'waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner'],
  '/orders': ['customer', 'waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner'],
  '/track': ['customer', 'waiter', 'delivery', 'operation_manager', 'admin', 'owner'],
  '/checkout': ['customer'],
  '/payment': ['customer'],
  
  // Staff routes
  '/staff': ['waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner'],
  '/staff/kitchen': ['chef', 'operation_manager', 'admin', 'owner'],
  '/staff/delivery': ['delivery', 'operation_manager', 'admin', 'owner'],
  '/staff/tables': ['waiter', 'operation_manager', 'admin', 'owner'],
  
  // Management routes
  '/dashboard': ['operation_manager', 'admin', 'owner'],
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
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key') as any
    const userRole = decoded.role
    
    // Check if user has required role
    if (!requiredRoles.includes(userRole)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.userId)
    requestHeaders.set('x-user-role', decoded.role)
    requestHeaders.set('x-phone-number', decoded.phoneNumber || '')
    requestHeaders.set('x-telegram-id', decoded.telegramId || '')
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    
  } catch (error) {
    // Invalid token
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
  const loginUrl = new URL('/login', request.url)
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
