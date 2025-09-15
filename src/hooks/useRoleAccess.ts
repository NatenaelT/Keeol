'use client'

import { useAuth, UserRole } from '@/contexts/AuthContext'

export function useRoleAccess() {
  const { user, hasRole, hasPermission } = useAuth()

  const checkRole = (roles: UserRole | UserRole[]): boolean => {
    return hasRole(roles)
  }

  const checkPermission = (permission: string | string[], requireAll = false): boolean => {
    const permissions = Array.isArray(permission) ? permission : [permission]
    
    if (requireAll) {
      return permissions.every(perm => hasPermission(perm))
    } else {
      return permissions.some(perm => hasPermission(perm))
    }
  }

  // Role-specific access checks
  const isCustomer = (): boolean => checkRole('customer')
  const isWaiter = (): boolean => checkRole('waiter')
  const isChef = (): boolean => checkRole('chef')
  const isDelivery = (): boolean => checkRole('delivery')
  const isOperationManager = (): boolean => checkRole('operation_manager')
  const isAdmin = (): boolean => checkRole('admin')
  const isOwner = (): boolean => checkRole('owner')

  // Combined role checks
  const isStaff = (): boolean => checkRole(['waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner'])
  const isManager = (): boolean => checkRole(['operation_manager', 'admin', 'owner'])
  const isAdminOrOwner = (): boolean => checkRole(['admin', 'owner'])

  // Feature-specific access checks
  const canViewOrders = (): boolean => {
    return checkPermission(['order.view', 'order.manage'])
  }

  const canCreateOrders = (): boolean => {
    return checkPermission('order.create')
  }

  const canManageOrders = (): boolean => {
    return checkPermission('order.manage')
  }

  const canViewKitchen = (): boolean => {
    return checkRole(['chef', 'operation_manager', 'admin', 'owner'])
  }

  const canManageInventory = (): boolean => {
    return checkPermission('inventory.manage')
  }

  const canViewReports = (): boolean => {
    return checkPermission('reports.view')
  }

  const canManageStaff = (): boolean => {
    return checkRole(['admin', 'owner'])
  }

  const canManageRoles = (): boolean => {
    return checkRole(['admin', 'owner'])
  }

  const canManageSystem = (): boolean => {
    return checkRole('owner')
  }

  const canAccessCRM = (): boolean => {
    return checkRole(['operation_manager', 'admin', 'owner'])
  }

  const canManageContent = (): boolean => {
    return checkPermission('cms.manage') || checkRole(['admin', 'owner'])
  }

  const canViewAnalytics = (): boolean => {
    return checkRole(['operation_manager', 'admin', 'owner'])
  }

  // Get user's default dashboard route
  const getDefaultDashboard = (): string => {
    if (!user) return '/'
    
    switch (user.role) {
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

  // Get available menu items based on role
  const getNavigationItems = () => {
    if (!user) return []

    const baseItems = [
      { label: 'Home', href: '/', roles: ['*'] },
      { label: 'Menu', href: '/menu', roles: ['*'] },
    ]

    const customerItems = [
      { label: 'My Orders', href: '/orders', roles: ['customer'] },
      { label: 'Track Order', href: '/track', roles: ['customer'] },
    ]

    const staffItems = [
      { label: 'Staff Portal', href: '/staff', roles: ['waiter', 'chef', 'delivery', 'operation_manager', 'admin', 'owner'] },
      { label: 'Kitchen', href: '/staff/kitchen', roles: ['chef', 'operation_manager', 'admin', 'owner'] },
      { label: 'Tables', href: '/staff/tables', roles: ['waiter', 'operation_manager', 'admin', 'owner'] },
      { label: 'Delivery', href: '/staff/delivery', roles: ['delivery', 'operation_manager', 'admin', 'owner'] },
    ]

    const managementItems = [
      { label: 'Dashboard', href: '/dashboard', roles: ['operation_manager', 'admin', 'owner'] },
      { label: 'Analytics', href: '/dashboard/analytics', roles: ['operation_manager', 'admin', 'owner'] },
      { label: 'Inventory', href: '/dashboard/inventory', roles: ['operation_manager', 'admin', 'owner'] },
    ]

    const adminItems = [
      { label: 'Admin Panel', href: '/admin', roles: ['admin', 'owner'] },
      { label: 'User Management', href: '/admin/users', roles: ['admin', 'owner'] },
      { label: 'CMS', href: '/admin/cms', roles: ['admin', 'owner'] },
      { label: 'System Settings', href: '/admin/system', roles: ['owner'] },
    ]

    const allItems = [...baseItems, ...customerItems, ...staffItems, ...managementItems, ...adminItems]

    return allItems.filter(item => 
      item.roles.includes('*') || item.roles.includes(user.role)
    )
  }

  return {
    user,
    checkRole,
    checkPermission,
    isCustomer,
    isWaiter,
    isChef,
    isDelivery,
    isOperationManager,
    isAdmin,
    isOwner,
    isStaff,
    isManager,
    isAdminOrOwner,
    canViewOrders,
    canCreateOrders,
    canManageOrders,
    canViewKitchen,
    canManageInventory,
    canViewReports,
    canManageStaff,
    canManageRoles,
    canManageSystem,
    canAccessCRM,
    canManageContent,
    canViewAnalytics,
    getDefaultDashboard,
    getNavigationItems,
  }
}
