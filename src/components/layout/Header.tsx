'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  ShoppingCart, 
  User, 
  Bell, 
  LogOut, 
  Settings,
  ChefHat,
  Phone,
  MapPin
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { useRoleAccess } from '@/hooks/useRoleAccess'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const { user, isAuthenticated, logout } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { getNavigationItems, getDefaultDashboard, isAdmin, isStaff } = useRoleAccess()
  const router = useRouter()
  const pathname = usePathname()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false)
      setShowNotifications(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Get role-based navigation
  const navigation = isAuthenticated ? getNavigationItems() : [
    { label: 'Home', href: '/' },
    { label: 'Menu', href: '/menu' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  // Role-based user menu
  const getUserNavigation = () => {
    const baseItems = [
      { name: 'Profile', href: '/profile', icon: User },
    ]

    if (user?.role === 'customer') {
      return [
        ...baseItems,
        { name: 'My Orders', href: '/orders', icon: ShoppingCart },
        { name: 'Track Order', href: '/track', icon: ShoppingCart },
        { name: 'Loyalty Points', href: '/loyalty', icon: Settings },
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    }

    if (isStaff()) {
      const staffItems = [
        ...baseItems,
        { name: 'Dashboard', href: getDefaultDashboard(), icon: ShoppingCart },
      ]

      if (isAdmin()) {
        staffItems.push(
          { name: 'Admin Panel', href: '/admin', icon: Settings },
          { name: 'User Analytics', href: '/admin/analytics', icon: ShoppingCart },
          { name: 'CRM', href: '/dashboard/crm', icon: User }
        )
      }

      staffItems.push({ name: 'Settings', href: '/settings', icon: Settings })
      return staffItems
    }

    return baseItems
  }

  const userNavigation = getUserNavigation()

  const handleLogout = () => {
    logout()
    router.push('/')
    setShowUserMenu(false)
  }

  const handleNotificationClick = (id: string) => {
    markAsRead(id)
    setShowNotifications(false)
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">keol</h1>
              <p className="text-xs text-gray-600">& Pizza House</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.slice(0, 6).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  pathname === item.href
                    ? 'text-brand-red'
                    : scrolled
                      ? 'text-gray-900 hover:text-brand-red'
                      : 'text-white hover:text-brand-yellow'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {/* Dashboard/Admin Quick Access */}
            {isAuthenticated && isStaff() && (
              <Link
                href={getDefaultDashboard()}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  scrolled
                    ? 'bg-brand-red text-white hover:bg-brand-red-dark'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {isAdmin() ? 'Admin' : 'Dashboard'}
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Contact Info (Desktop) */}
            <div className="hidden xl:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-brand-red" />
                <span className={scrolled ? 'text-gray-900' : 'text-white'}>
                  +251-911-123456
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-brand-red" />
                <span className={scrolled ? 'text-gray-900' : 'text-white'}>
                  Bole, Addis Ababa
                </span>
              </div>
            </div>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowNotifications(!showNotifications)
                      setShowUserMenu(false)
                    }}
                    className={`relative p-2 rounded-lg transition-colors duration-200 ${
                      scrolled
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-brand-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-96 overflow-y-auto"
                      >
                        <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-brand-red hover:text-brand-red-dark"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification.id)}
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                                notification.isRead 
                                  ? 'border-transparent' 
                                  : 'border-brand-red bg-red-50'
                              }`}
                            >
                              <h4 className="font-medium text-sm text-gray-900">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          ))
                        )}
                        {notifications.length > 5 && (
                          <div className="px-4 py-2 border-t border-gray-200">
                            <Link
                              href="/notifications"
                              className="text-sm text-brand-red hover:text-brand-red-dark"
                            >
                              View all notifications
                            </Link>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(!showUserMenu)
                      setShowNotifications(false)
                    }}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 ${
                      scrolled
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden md:block font-medium">
                      {user?.name || 'User'}
                    </span>
                  </button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                      >
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="font-medium text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
                        </div>
                        {userNavigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <item.icon className="w-4 h-4 mr-3" />
                            {item.name}
                          </Link>
                        ))}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth?mode=signin"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    scrolled
                      ? 'text-gray-900 hover:text-brand-red'
                      : 'text-white hover:text-brand-yellow'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth?mode=signup"
                  className={`text-sm font-medium transition-colors duration-200 ml-4 ${
                    scrolled
                      ? 'text-gray-900 hover:text-brand-red'
                      : 'text-white hover:text-brand-yellow'
                  }`}
                >
                  Sign Up
                </Link>
                <Link
                  href="/menu"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Order Now
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors duration-200 ${
                scrolled
                  ? 'text-gray-900 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white border-t border-gray-200"
            >
              <div className="py-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg mx-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {isAuthenticated && isStaff() && (
                  <Link
                    href={getDefaultDashboard()}
                    className="block btn-primary mx-2 mt-2 text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    {isAdmin() ? 'Admin Panel' : 'Dashboard'}
                  </Link>
                )}
                {!isAuthenticated && (
                  <>
                    <Link
                      href="/auth?mode=signin"
                      className="block px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg mx-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth?mode=signup"
                      className="block px-4 py-2 text-gray-900 hover:bg-gray-100 rounded-lg mx-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                    <Link
                      href="/menu"
                      className="block btn-primary mx-2 mt-4 text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Order Now
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header
