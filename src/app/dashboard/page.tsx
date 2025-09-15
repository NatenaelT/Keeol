'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRoleAccess } from '@/hooks/useRoleAccess'

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { getDefaultDashboard } = useRoleAccess()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Redirect to appropriate dashboard based on role
      const defaultDashboard = getDefaultDashboard()
      if (defaultDashboard !== '/dashboard') {
        router.replace(defaultDashboard)
      }
    } else if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [user, isAuthenticated, isLoading, router, getDefaultDashboard])

  // Show loading while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading-spinner"></div>
    </div>
  )
}

export default DashboardPage
