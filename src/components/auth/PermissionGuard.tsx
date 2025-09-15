'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface PermissionGuardProps {
  children: ReactNode
  permission: string | string[]
  fallback?: ReactNode
  requireAll?: boolean // If true, user must have ALL permissions. If false, user needs ANY permission
}

const PermissionGuard = ({ 
  children, 
  permission, 
  fallback = null,
  requireAll = false 
}: PermissionGuardProps) => {
  const { hasPermission } = useAuth()

  const permissions = Array.isArray(permission) ? permission : [permission]
  
  let hasAccess: boolean
  
  if (requireAll) {
    // User must have ALL permissions
    hasAccess = permissions.every(perm => hasPermission(perm))
  } else {
    // User needs ANY of the permissions
    hasAccess = permissions.some(perm => hasPermission(perm))
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export default PermissionGuard
