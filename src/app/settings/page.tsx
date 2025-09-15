'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Shield,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Settings as SettingsIcon,
  Lock,
  Smartphone,
  Globe
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface UserSettings {
  notifications: {
    orderUpdates: boolean
    promotions: boolean
    newsletter: boolean
    smsNotifications: boolean
    telegramNotifications: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private'
    showOrderHistory: boolean
    shareDataForAnalytics: boolean
  }
  preferences: {
    language: string
    currency: string
    theme: 'light' | 'dark' | 'auto'
    defaultDeliveryAddress?: string
  }
}

const SettingsPage = () => {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      orderUpdates: true,
      promotions: true,
      newsletter: false,
      smsNotifications: true,
      telegramNotifications: true
    },
    privacy: {
      profileVisibility: 'private',
      showOrderHistory: false,
      shareDataForAnalytics: true
    },
    preferences: {
      language: 'en',
      currency: 'ETB',
      theme: 'light'
    }
  })
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: SettingsIcon },
    { id: 'security', name: 'Security', icon: Lock }
  ]

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }, [user])

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // Validate form
      if (!profileForm.name.trim()) {
        toast.error('Name is required')
        return
      }

      if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }

      // In production, make API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // In production, make API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )
    
    if (confirmed) {
      setIsLoading(true)
      try {
        // In production, make API call to delete account
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success('Account deletion request submitted')
      } catch (error) {
        toast.error('Failed to delete account')
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access settings</h2>
          <a href="/login" className="btn-primary">Sign In</a>
        </div>
      </div>
    )
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={profileForm.name}
            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={profileForm.email}
            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
            className="input-field"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <input
          type="tel"
          value={profileForm.phone}
          onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
          className="input-field"
          readOnly
        />
        <p className="text-sm text-gray-500 mt-1">Phone number cannot be changed. Contact support if needed.</p>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={profileForm.currentPassword}
                onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={profileForm.confirmPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={handleSaveProfile}
          disabled={isLoading}
          className="btn-primary flex items-center gap-2"
        >
          {isLoading ? (
            <div className="loading-spinner w-4 h-4"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.orderUpdates}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, orderUpdates: e.target.checked }
              }))}
              className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
            />
            <span className="ml-3 text-sm text-gray-700">Order status updates</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.smsNotifications}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, smsNotifications: e.target.checked }
              }))}
              className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
            />
            <span className="ml-3 text-sm text-gray-700">SMS notifications</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.telegramNotifications}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, telegramNotifications: e.target.checked }
              }))}
              className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
            />
            <span className="ml-3 text-sm text-gray-700">Telegram notifications</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Marketing Communications</h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.promotions}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, promotions: e.target.checked }
              }))}
              className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
            />
            <span className="ml-3 text-sm text-gray-700">Promotional offers and discounts</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.newsletter}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, newsletter: e.target.checked }
              }))}
              className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
            />
            <span className="ml-3 text-sm text-gray-700">Monthly newsletter</span>
          </label>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="btn-primary flex items-center gap-2"
        >
          {isLoading ? (
            <div className="loading-spinner w-4 h-4"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </button>
      </div>
    </div>
  )

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={settings.preferences.language}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              preferences: { ...prev.preferences, language: e.target.value }
            }))}
            className="input-field"
          >
            <option value="en">English</option>
            <option value="am">አማርኛ (Amharic)</option>
            <option value="om">Afaan Oromoo</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={settings.preferences.currency}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              preferences: { ...prev.preferences, currency: e.target.value }
            }))}
            className="input-field"
          >
            <option value="ETB">Ethiopian Birr (ETB)</option>
            <option value="USD">US Dollar (USD)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
        <select
          value={settings.preferences.theme}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            preferences: { ...prev.preferences, theme: e.target.value as 'light' | 'dark' | 'auto' }
          }))}
          className="input-field"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto (System)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Default Delivery Address</label>
        <textarea
          value={settings.preferences.defaultDeliveryAddress || ''}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            preferences: { ...prev.preferences, defaultDeliveryAddress: e.target.value }
          }))}
          rows={3}
          className="input-field"
          placeholder="Enter your default delivery address..."
        />
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="btn-primary flex items-center gap-2"
        >
          {isLoading ? (
            <div className="loading-spinner w-4 h-4"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Preferences
        </button>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800 mb-2">Account Security</h3>
        <p className="text-sm text-yellow-700">
          Your account is secured with phone number authentication. 
          We recommend enabling two-factor authentication for additional security.
        </p>
      </div>

      <div className="border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 mb-4">Danger Zone</h3>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={isLoading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
        >
          {isLoading ? (
            <div className="loading-spinner w-4 h-4"></div>
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Delete Account
        </button>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'notifications':
        return renderNotificationsTab()
      case 'preferences':
        return renderPreferencesTab()
      case 'security':
        return renderSecurityTab()
      default:
        return renderProfileTab()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center gap-3 ${
                      activeTab === tab.id
                        ? 'bg-brand-red text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
