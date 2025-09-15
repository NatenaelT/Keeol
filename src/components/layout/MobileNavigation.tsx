'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Home, 
  UtensilsCrossed, 
  ShoppingCart, 
  MessageCircle, 
  User,
  ChefHat,
  Users,
  Truck,
  BarChart3,
  Settings,
  Clipboard,
  Clock
} from 'lucide-react'
import { useRoleAccess } from '@/hooks/useRoleAccess'

const MobileNavigation = () => {
  const pathname = usePathname()
  const { user, isCustomer, isWaiter, isChef, isDelivery, isManager } = useRoleAccess()

  if (!user) return null

  // Define navigation items for each role
  const getNavigationItems = () => {
    const baseItems = [
      { icon: Home, label: 'Home', href: '/', roles: ['*'] }
    ]

    if (isCustomer()) {
      return [
        { icon: Home, label: 'Home', href: '/' },
        { icon: UtensilsCrossed, label: 'Menu', href: '/menu' },
        { icon: ShoppingCart, label: 'Orders', href: '/orders' },
        { icon: MessageCircle, label: 'Chat', href: '/chat' },
        { icon: User, label: 'Profile', href: '/profile' }
      ]
    }

    if (isWaiter()) {
      return [
        { icon: Home, label: 'Dashboard', href: '/staff' },
        { icon: Users, label: 'Tables', href: '/staff/tables' },
        { icon: Clipboard, label: 'Orders', href: '/staff/orders' },
        { icon: MessageCircle, label: 'Chat', href: '/staff/chat' },
        { icon: User, label: 'Profile', href: '/profile' }
      ]
    }

    if (isChef()) {
      return [
        { icon: Home, label: 'Dashboard', href: '/staff' },
        { icon: ChefHat, label: 'Kitchen', href: '/staff/kitchen' },
        { icon: Clock, label: 'Queue', href: '/staff/kitchen/queue' },
        { icon: MessageCircle, label: 'Chat', href: '/staff/chat' },
        { icon: User, label: 'Profile', href: '/profile' }
      ]
    }

    if (isDelivery()) {
      return [
        { icon: Home, label: 'Dashboard', href: '/staff' },
        { icon: Truck, label: 'Deliveries', href: '/staff/delivery' },
        { icon: Clipboard, label: 'Route', href: '/staff/delivery/route' },
        { icon: MessageCircle, label: 'Chat', href: '/staff/chat' },
        { icon: User, label: 'Profile', href: '/profile' }
      ]
    }

    if (isManager()) {
      return [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
        { icon: Users, label: 'Staff', href: '/dashboard/staff' },
        { icon: MessageCircle, label: 'CRM', href: '/dashboard/crm' },
        { icon: Settings, label: 'Settings', href: '/dashboard/settings' }
      ]
    }

    // Default items for other roles
    return baseItems
  }

  const navigationItems = getNavigationItems()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item, index) => {
          const active = isActive(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center p-2 min-w-0 flex-1"
            >
              <motion.div
                className={`mobile-nav-item ${
                  active ? 'mobile-nav-active' : 'mobile-nav-inactive'
                }`}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium truncate">
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-brand-red rounded-lg -z-10"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default MobileNavigation
