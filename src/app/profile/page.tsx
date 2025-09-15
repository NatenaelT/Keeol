'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Star,
  Gift,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  ShoppingBag,
  Clock,
  Heart,
  Edit2,
  Save,
  X,
  Crown,
  Target,
  Zap
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface UserProfile {
  id: string
  name: string
  email?: string
  phone_number: string
  role: string
  loyalty_points: number
  loyalty_tier: string
  created_at: string
  last_login?: string
  avatar_url?: string
}

interface LoyaltyStats {
  totalEarned: number
  totalSpent: number
  currentBalance: number
  tier: string
  tierProgress: number
  nextTierRequirement: number
}

interface LoyaltyTransaction {
  id: string
  type: 'earned' | 'spent' | 'bonus' | 'expired'
  points: number
  description: string
  date: string
  order_id?: string
}

interface Reward {
  id: string
  name: string
  description: string
  points_required: number
  reward_type: string
  reward_value: number
  is_active: boolean
}

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loyaltyStats, setLoyaltyStats] = useState<LoyaltyStats>({
    totalEarned: 0,
    totalSpent: 0,
    currentBalance: 0,
    tier: 'Bronze',
    tierProgress: 0,
    nextTierRequirement: 1000
  })
  const [recentTransactions, setRecentTransactions] = useState<LoyaltyTransaction[]>([])
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchLoyaltyData()
      fetchRewards()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      // Mock profile data - in production, fetch from API
      const mockProfile: UserProfile = {
        id: user?.id || '',
        name: user?.name || '',
        email: user?.email || '',
        phone_number: user?.phoneNumber || '',
        role: user?.role || '',
        loyalty_points: user?.loyaltyPoints || 0,
        loyalty_tier: user?.loyaltyTier || 'Bronze',
        created_at: user?.createdAt || new Date().toISOString(),
        last_login: new Date().toISOString()
      }
      
      setProfile(mockProfile)
      setEditForm({
        name: mockProfile.name,
        email: mockProfile.email || ''
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const fetchLoyaltyData = async () => {
    try {
      // Mock loyalty data
      const tier = user?.loyaltyTier || 'Bronze'
      const points = user?.loyaltyPoints || 0
      
      const tierRequirements = {
        Bronze: 1000,
        Silver: 2500,
        Gold: 5000,
        Platinum: 10000
      }

      const currentRequirement = tierRequirements[tier as keyof typeof tierRequirements] || 1000
      const nextTier = tier === 'Bronze' ? 'Silver' : tier === 'Silver' ? 'Gold' : tier === 'Gold' ? 'Platinum' : 'Platinum'
      const nextRequirement = tierRequirements[nextTier as keyof typeof tierRequirements] || 10000

      setLoyaltyStats({
        totalEarned: points + 450, // Mock total earned
        totalSpent: 120, // Mock total spent
        currentBalance: points,
        tier,
        tierProgress: Math.min((points / nextRequirement) * 100, 100),
        nextTierRequirement: nextRequirement
      })

      // Mock recent transactions
      setRecentTransactions([
        {
          id: '1',
          type: 'earned',
          points: 45,
          description: 'Order #2847 - Keeol Special Burger',
          date: new Date(Date.now() - 86400000).toISOString(),
          order_id: '2847'
        },
        {
          id: '2',
          type: 'spent',
          points: -50,
          description: 'Redeemed: 10% Off Discount',
          date: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '3',
          type: 'earned',
          points: 32,
          description: 'Order #2834 - Margherita Pizza',
          date: new Date(Date.now() - 259200000).toISOString(),
          order_id: '2834'
        },
        {
          id: '4',
          type: 'bonus',
          points: 100,
          description: 'Welcome Bonus',
          date: new Date(Date.now() - 345600000).toISOString()
        }
      ])
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error)
    }
  }

  const fetchRewards = async () => {
    try {
      // Mock rewards data
      setAvailableRewards([
        {
          id: '1',
          name: '10% Off Next Order',
          description: 'Get 10% discount on your next order',
          points_required: 100,
          reward_type: 'discount_percentage',
          reward_value: 10,
          is_active: true
        },
        {
          id: '2',
          name: 'Free Delivery',
          description: 'Free delivery on your next order',
          points_required: 150,
          reward_type: 'free_delivery',
          reward_value: 0,
          is_active: true
        },
        {
          id: '3',
          name: '50 ETB Discount',
          description: 'Get 50 ETB off your next order',
          points_required: 400,
          reward_type: 'discount_amount',
          reward_value: 50,
          is_active: true
        },
        {
          id: '4',
          name: 'Free Burger',
          description: 'Get a free Keeol Special Burger',
          points_required: 600,
          reward_type: 'free_item',
          reward_value: 0,
          is_active: true
        }
      ])
    } catch (error) {
      console.error('Failed to fetch rewards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      // In production, this would make an API call to update the profile
      setProfile(prev => prev ? {
        ...prev,
        name: editForm.name,
        email: editForm.email
      } : null)
      
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleRedeemReward = async (rewardId: string, pointsRequired: number) => {
    if (loyaltyStats.currentBalance < pointsRequired) {
      toast.error('Insufficient points for this reward')
      return
    }

    try {
      // In production, this would make an API call
      setLoyaltyStats(prev => ({
        ...prev,
        currentBalance: prev.currentBalance - pointsRequired,
        totalSpent: prev.totalSpent + pointsRequired
      }))

      const reward = availableRewards.find(r => r.id === rewardId)
      toast.success(`${reward?.name} redeemed successfully!`)
    } catch (error) {
      toast.error('Failed to redeem reward')
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'from-purple-400 to-purple-600'
      case 'gold': return 'from-yellow-400 to-yellow-600'
      case 'silver': return 'from-gray-300 to-gray-500'
      default: return 'from-orange-400 to-orange-600'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return Crown
      case 'gold': return Award
      case 'silver': return Star
      default: return Target
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your profile</h2>
          <a href="/login" className="btn-primary">Sign In</a>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const TierIcon = getTierIcon(loyaltyStats.tier)

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account and loyalty rewards</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button onClick={handleSaveProfile} className="btn-primary flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-brand-red to-brand-red-dark rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {profile?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{profile?.name}</h3>
                      <p className="text-gray-600 capitalize">{profile?.role}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{profile?.phone_number}</span>
                    </div>
                    {profile?.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{profile.email}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">Joined {formatDate(profile?.created_at || '')}</span>
                    </div>
                    {profile?.last_login && (
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">Last login {formatDate(profile.last_login)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'earned' ? 'bg-green-100' :
                        transaction.type === 'spent' ? 'bg-red-100' :
                        transaction.type === 'bonus' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {transaction.type === 'earned' ? <TrendingUp className="w-4 h-4 text-green-600" /> :
                         transaction.type === 'spent' ? <ShoppingBag className="w-4 h-4 text-red-600" /> :
                         transaction.type === 'bonus' ? <Gift className="w-4 h-4 text-blue-600" /> :
                         <Clock className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      transaction.type === 'earned' || transaction.type === 'bonus' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'earned' || transaction.type === 'bonus' ? '+' : ''}{transaction.points}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Loyalty Sidebar */}
          <div className="space-y-6">
            {/* Loyalty Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${getTierColor(loyaltyStats.tier)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <TierIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{loyaltyStats.tier} Member</h3>
                <p className="text-3xl font-bold text-brand-red mt-2">{loyaltyStats.currentBalance}</p>
                <p className="text-sm text-gray-600">Available Points</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress to {loyaltyStats.tier === 'Platinum' ? 'Max Tier' : 'Next Tier'}</span>
                    <span>{Math.round(loyaltyStats.tierProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${getTierColor(loyaltyStats.tier)} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${loyaltyStats.tierProgress}%` }}
                    ></div>
                  </div>
                  {loyaltyStats.tier !== 'Platinum' && (
                    <p className="text-xs text-gray-500 mt-2">
                      {loyaltyStats.nextTierRequirement - loyaltyStats.currentBalance} more points to next tier
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Earned</p>
                    <p className="text-lg font-semibold text-gray-900">{loyaltyStats.totalEarned}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Spent</p>
                    <p className="text-lg font-semibold text-gray-900">{loyaltyStats.totalSpent}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Available Rewards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Rewards</h3>
              <div className="space-y-3">
                {availableRewards.map((reward) => (
                  <div key={reward.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{reward.name}</h4>
                        <p className="text-sm text-gray-600">{reward.description}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium">{reward.points_required}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRedeemReward(reward.id, reward.points_required)}
                      disabled={loyaltyStats.currentBalance < reward.points_required}
                      className={`w-full text-sm py-2 px-3 rounded-lg transition-colors duration-200 ${
                        loyaltyStats.currentBalance >= reward.points_required
                          ? 'bg-brand-red text-white hover:bg-brand-red-dark'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {loyaltyStats.currentBalance >= reward.points_required ? 'Redeem' : 'Insufficient Points'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
