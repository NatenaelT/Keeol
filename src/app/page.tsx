'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChefHat, Clock, MapPin, Star, ArrowRight, Phone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LiveChat from '@/components/chat/LiveChat'

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: <ChefHat className="w-8 h-8" />,
      title: "Fresh Ingredients",
      description: "We use only the freshest ingredients in every dish"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Fast Delivery",
      description: "Quick delivery within 30 minutes in Addis Ababa"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Multiple Locations",
      description: "Convenient locations across the city"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Top Rated",
      description: "Loved by thousands of customers"
    }
  ]

  const popularItems = [
    {
      id: 1,
      name: "keol Special Burger",
      price: "450 ETB",
      image: "/images/burger-special.jpg",
      rating: 4.8,
      description: "Our signature burger with double beef patty"
    },
    {
      id: 2,
      name: "Margherita Pizza",
      price: "380 ETB",
      image: "/images/pizza-margherita.jpg", 
      rating: 4.9,
      description: "Classic Italian pizza with fresh basil"
    },
    {
      id: 3,
      name: "Chicken Deluxe",
      price: "420 ETB",
      image: "/images/chicken-deluxe.jpg",
      rating: 4.7,
      description: "Crispy chicken with special sauce"
    }
  ]

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-red via-brand-red-dark to-brand-black">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container-responsive relative z-10 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold font-display mb-6 text-shadow">
              keol
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
              Delicious burgers and pizzas made with love, delivered fresh to your door
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/menu" className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2">
                Order Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/track" className="btn-outline bg-white/10 border-white text-white hover:bg-white hover:text-brand-red text-lg px-8 py-4">
                Track Order
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose keol?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best food experience in Ethiopia
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-brand-red text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="py-20">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Items</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Taste our customer favorites
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-brand-secondary to-brand-red flex items-center justify-center text-white text-2xl font-bold">
                    {item.name}
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium">{item.rating}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-brand-red">{item.price}</span>
                  <button className="btn-primary py-2 px-4 text-sm">
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/menu" className="btn-secondary inline-flex items-center gap-2">
              View Full Menu <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-brand-red text-white">
        <div className="container-responsive text-center">
          <h2 className="text-4xl font-bold mb-8">Get in Touch</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex items-center gap-4">
              <Phone className="w-6 h-6" />
              <span className="text-xl">+251-911-123456</span>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-6 h-6" />
              <span className="text-xl">Bole, Addis Ababa</span>
            </div>
          </div>
        </div>
      </section>

      {/* <Footer /> */}
      <LiveChat />
    </div>
  )
}
