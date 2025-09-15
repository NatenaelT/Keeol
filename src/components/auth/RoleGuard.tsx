'use client'

import { ReactNode } from 'react'
import { useAuth, UserRole } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { ShieldOff, Home } from 'lucide-react'
import Link from 'next/link'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole | UserRole[]
  fallback?: ReactNode
  redirectTo?: string
}

const RoleGuard = ({ 
  children, 
  allowedRoles, 
  fallback,
  redirectTo 
}: RoleGuardProps) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    if (fallback) return <>{fallback}</>
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8"
        >
          <ShieldOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access this page</p>
          <div className="space-x-4">
            <Link href="/login" className="btn-primary">
              Sign In
            </Link>
            <Link href="/" className="btn-outline">
              Go Home
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Check role permissions
  const allowedRoleArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  const hasPermission = allowedRoleArray.includes(user.role)

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8"
        >
          <ShieldOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-2">
            You don't have permission to access this page
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Your role: <span className="font-medium capitalize">{user.role}</span>
          </p>
          <div className="space-x-4">
            <Link 
              href={redirectTo || getDefaultHomeForRole(user.role)} 
              className="btn-primary inline-flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
            <Link href="/" className="btn-outline">
              Go Home
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}

function getDefaultHomeForRole(role: UserRole): string {
  switch (role) {
    case 'customer':
      return '/orders'
    case 'waiter':
      return '/staff/tables'
    case 'chef':
      return '/staff/kitchen'
    case 'delivery':
      return '/staff/delivery'
    case 'operation_manager':
      return '/dashboard'
    case 'admin':
      return '/admin'
    case 'owner':
      return '/admin'
    default:
      return '/'
  }
}

export default RoleGuard
