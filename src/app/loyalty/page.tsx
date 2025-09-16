'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Gift,
  TrendingUp,
  Award,
  Crown,
  Target,
  Zap,
  Clock,
  Calendar,
  ArrowRight,
  ShoppingBag,
  Heart,
  Sparkles
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

interface LoyaltyTier {
  name: string
  pointsRequired: number
  benefits: string[]
  color: string
  icon: React.ComponentType<{ className?: string }>
}

interface Reward {
  id: string
  name: string
  description: string
  points_required: number
  reward_type: string
  reward_value: number
  category: string
  is_active: boolean
  popularity?: number
}

const LoyaltyPage = () => {
  const { user, isAuthenticated } = useAuth()
  const [userPoints, setUserPoints] = useState(0)
  const [userTier, setUserTier] = useState('Bronze')
  const [rewards, setRewards] = useState<Reward[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')

  const loyaltyTiers: LoyaltyTier[] = [
    {
      name: 'Bronze',
      pointsRequired: 0,
      benefits: ['Earn 1 point per ETB spent', 'Birthday bonus', 'Member-only offers'],
      color: 'from-orange-400 to-orange-600',
      icon: Target
    },
    {
      name: 'Silver',
      pointsRequired: 1000,
      benefits: ['Earn 1.2 points per ETB spent', 'Free delivery twice a month', 'Priority support'],
      color: 'from-gray-300 to-gray-500',
      icon: Star
    },
    {
      name: 'Gold',
      pointsRequired: 2500,
      benefits: ['Earn 1.5 points per ETB spent', 'Free delivery every week', 'Exclusive menu items'],
      color: 'from-yellow-400 to-yellow-600',
      icon: Award
    },
    {
      name: 'Platinum',
      pointsRequired: 5000,
      benefits: ['Earn 2 points per ETB spent', 'Always free delivery', 'Personal food concierge'],
      color: 'from-purple-400 to-purple-600',
      icon: Crown
    }
  ]

  const rewardCategories = [
    { id: 'all', name: 'All Rewards' },
    { id: 'discounts', name: 'Discounts' },
    { id: 'free_items', name: 'Free Items' },
    { id: 'delivery', name: 'Delivery' },
    { id: 'special', name: 'Special Offers' }
  ]

  useEffect(() => {
    if (user) {
      setUserPoints(user.loyaltyPoints || 0)
      setUserTier(user.loyaltyTier || 'Bronze')
      fetchRewards()
    }
  }, [user])

  const fetchRewards = async () => {
    // Mock rewards data with categories
    const mockRewards: Reward[] = [
      {
        id: '1',
        name: '10% Off Next Order',
        description: 'Get 10% discount on your next order',
        points_required: 100,
        reward_type: 'discount_percentage',
        reward_value: 10,
        category: 'discounts',
        is_active: true,
        popularity: 95
      },
      {
        id: '2',
        name: 'Free Delivery',
        description: 'Free delivery on your next order',
        points_required: 150,
        reward_type: 'free_delivery',
        reward_value: 0,
        category: 'delivery',
        is_active: true,
        popularity: 88
      },
      {
        id: '3',
        name: 'Free Soft Drink',
        description: 'Get a free soft drink with any order',
        points_required: 200,
        reward_type: 'free_item',
        reward_value: 0,
        category: 'free_items',
        is_active: true,
        popularity: 76
      },
      {
        id: '4',
        name: '15% Off Next Order',
        description: 'Get 15% discount on your next order',
        points_required: 250,
        reward_type: 'discount_percentage',
        reward_value: 15,
        category: 'discounts',
        is_active: true,
        popularity: 82
      },
      {
        id: '5',
        name: '50 ETB Discount',
        description: 'Get 50 ETB off your next order',
        points_required: 400,
        reward_type: 'discount_amount',
        reward_value: 50,
        category: 'discounts',
        is_active: true,
        popularity: 91
      },
      {
        id: '6',
        name: 'Free Burger',
        description: 'Get a free keol Special Burger',
        points_required: 600,
        reward_type: 'free_item',
        reward_value: 0,
        category: 'free_items',
        is_active: true,
        popularity: 85
      },
      {
        id: '7',
        name: 'VIP Experience',
        description: 'Skip the queue and get priority service',
        points_required: 800,
        reward_type: 'special_offer',
        reward_value: 0,
        category: 'special',
        is_active: true,
        popularity: 67
      },
      {
        id: '8',
        name: '100 ETB Discount',
        description: 'Get 100 ETB off your next order',
        points_required: 1000,
        reward_type: 'discount_amount',
        reward_value: 100,
        category: 'discounts',
        is_active: true,
        popularity: 89
      }
    ]

    setRewards(mockRewards)
  }

  const getCurrentTier = () => {
    return loyaltyTiers.find(tier => tier.name === userTier) || loyaltyTiers[0]
  }

  const getNextTier = () => {
    const currentIndex = loyaltyTiers.findIndex(tier => tier.name === userTier)
    return currentIndex < loyaltyTiers.length - 1 ? loyaltyTiers[currentIndex + 1] : null
  }

  const getTierProgress = () => {
    const nextTier = getNextTier()
    if (!nextTier) return 100
    return Math.min((userPoints / nextTier.pointsRequired) * 100, 100)
  }

  const getFilteredRewards = () => {
    if (selectedCategory === 'all') return rewards
    return rewards.filter(reward => reward.category === selectedCategory)
  }

  const handleRedeemReward = async (rewardId: string, pointsRequired: number) => {
    if (userPoints < pointsRequired) {
      alert('Insufficient points for this reward')
      return
    }

    // In production, this would make an API call
    setUserPoints(prev => prev - pointsRequired)
    alert('Reward redeemed successfully!')
  }

  const RewardCard = ({ reward }: { reward: Reward }) => {
    const canRedeem = userPoints >= reward.points_required
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white rounded-xl p-6 border-2 transition-all duration-300 ${
          canRedeem 
            ? 'border-brand-red shadow-lg hover:shadow-xl hover:border-brand-red-dark' 
            : 'border-gray-200 opacity-75'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${
              reward.category === 'discounts' ? 'bg-blue-100' :
              reward.category === 'free_items' ? 'bg-green-100' :
              reward.category === 'delivery' ? 'bg-purple-100' : 'bg-orange-100'
            }`}>
              {reward.category === 'discounts' ? <TrendingUp className="w-5 h-5 text-blue-600" /> :
               reward.category === 'free_items' ? <Gift className="w-5 h-5 text-green-600" /> :
               reward.category === 'delivery' ? <Zap className="w-5 h-5 text-purple-600" /> :
               <Sparkles className="w-5 h-5 text-orange-600" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{reward.name}</h3>
              {reward.popularity && (
                <div className="flex items-center space-x-1 mt-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-gray-500">{reward.popularity}% love this</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-brand-red">
              <Star className="w-4 h-4" />
              <span className="font-bold">{reward.points_required}</span>
            </div>
            <span className="text-xs text-gray-500">points</span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
        
        <button
          onClick={() => handleRedeemReward(reward.id, reward.points_required)}
          disabled={!canRedeem}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
            canRedeem
              ? 'bg-brand-red text-white hover:bg-brand-red-dark'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {canRedeem ? 'Redeem Now' : 'Need More Points'}
        </button>
      </motion.div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Star className="w-16 h-16 text-brand-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Our Loyalty Program</h2>
          <p className="text-gray-600 mb-6">Sign in to start earning points and unlock amazing rewards!</p>
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    )
  }

  const currentTier = getCurrentTier()
  const nextTier = getNextTier()
  const TierIcon = currentTier.icon

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loyalty Rewards</h1>
            <p className="text-xl text-gray-600">Earn points, unlock rewards, and enjoy exclusive benefits</p>
          </motion.div>

          {/* Current Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-md mx-auto"
          >
            <div className={`w-20 h-20 bg-gradient-to-r ${currentTier.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <TierIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentTier.name} Member</h2>
            <div className="text-4xl font-bold text-brand-red mb-4">{userPoints}</div>
            <p className="text-gray-600 mb-4">Available Points</p>
            
            {nextTier && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress to {nextTier.name}</span>
                  <span>{Math.round(getTierProgress())}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`bg-gradient-to-r ${currentTier.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${getTierProgress()}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {nextTier.pointsRequired - userPoints} more points to {nextTier.name}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Loyalty Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Membership Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loyaltyTiers.map((tier, index) => {
              const TierIconComponent = tier.icon
              const isCurrentTier = tier.name === userTier
              const isUnlocked = userPoints >= tier.pointsRequired
              
              return (
                <div
                  key={tier.name}
                  className={`bg-white rounded-xl p-6 border-2 transition-all duration-300 ${
                    isCurrentTier
                      ? `border-2 ${tier.color.includes('orange') ? 'border-orange-500' : 
                          tier.color.includes('gray') ? 'border-gray-500' :
                          tier.color.includes('yellow') ? 'border-yellow-500' : 'border-purple-500'} shadow-lg`
                      : isUnlocked
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <TierIconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{tier.name}</h3>
                    <p className="text-sm text-gray-600">{tier.pointsRequired}+ points</p>
                    {isCurrentTier && (
                      <span className="inline-block mt-2 px-3 py-1 bg-brand-red text-white text-xs rounded-full">
                        Current Tier
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {tier.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-brand-red rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Rewards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Available Rewards</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field py-2 px-3 text-sm"
              >
                {rewardCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredRewards().map((reward) => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Order & Earn</h3>
              <p className="text-gray-600">Earn points with every order you place. The more you spend, the more you earn!</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Level Up</h3>
              <p className="text-gray-600">Advance through tiers to unlock better rewards and exclusive benefits.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Redeem Rewards</h3>
              <p className="text-gray-600">Use your points to get discounts, free items, and special experiences.</p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/menu"
            className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
          >
            Start Earning Points <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default LoyaltyPage
