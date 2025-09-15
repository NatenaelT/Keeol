'use client'

import { motion } from 'framer-motion'
import { 
  ChefHat, 
  Users, 
  Award, 
  Heart, 
  Clock, 
  MapPin,
  Phone,
  Mail,
  Star,
  Utensils,
  Truck
} from 'lucide-react'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

const AboutPage = () => {
  const stats = [
    { number: '5+', label: 'Years Experience', icon: Clock },
    { number: '10K+', label: 'Happy Customers', icon: Users },
    { number: '3', label: 'Locations', icon: MapPin },
    { number: '4.8', label: 'Average Rating', icon: Star },
  ]

  const values = [
    {
      icon: Heart,
      title: 'Quality First',
      description: 'We use only the finest ingredients and follow strict quality standards in every dish we prepare.'
    },
    {
      icon: Users,
      title: 'Customer Focused',
      description: 'Our customers are at the heart of everything we do. We listen, adapt, and continuously improve.'
    },
    {
      icon: Utensils,
      title: 'Authentic Flavors',
      description: 'We blend traditional Ethiopian tastes with international cuisine to create unique flavor experiences.'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'We ensure your food reaches you fresh and hot with our efficient delivery system.'
    }
  ]

  const team = [
    {
      name: 'Abebe Kebede',
      role: 'Head Chef',
      image: '/images/chef-1.jpg',
      description: '15+ years experience in international cuisine'
    },
    {
      name: 'Meron Tadesse',
      role: 'Restaurant Manager',
      image: '/images/manager-1.jpg',
      description: 'Expert in customer service and operations'
    },
    {
      name: 'Daniel Haile',
      role: 'Pizza Specialist',
      image: '/images/chef-2.jpg',
      description: 'Trained in authentic Italian pizza making'
    }
  ]

  const timeline = [
    {
      year: '2019',
      title: 'The Beginning',
      description: 'Started as a small burger joint in Bole with a vision to serve quality food.'
    },
    {
      year: '2020',
      title: 'Pizza Addition',
      description: 'Expanded menu to include authentic wood-fired pizzas and Italian dishes.'
    },
    {
      year: '2021',
      title: 'Second Location',
      description: 'Opened our second branch in Kazanchis due to popular demand.'
    },
    {
      year: '2022',
      title: 'Digital Innovation',
      description: 'Launched online ordering and delivery system across Addis Ababa.'
    },
    {
      year: '2023',
      title: 'Third Location',
      description: 'Expanded to Piassa with focus on traditional Ethiopian fusion.'
    },
    {
      year: '2024',
      title: 'Tech Integration',
      description: 'Introduced mobile app and advanced ordering system with real-time tracking.'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-brand-red to-brand-brown text-white py-20">
          <div className="container-responsive">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">About Keeol Burger</h1>
              <p className="text-xl md:text-2xl opacity-90 mb-8">
                Serving delicious burgers and pizzas with authentic Ethiopian hospitality since 2019
              </p>
              <div className="flex items-center justify-center gap-2">
                <ChefHat className="w-8 h-8" />
                <span className="text-lg font-medium">Made with Love in Addis Ababa</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-responsive">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container-responsive">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    Keeol Burger & Pizza House was born from a simple dream: to bring people together 
                    over great food. Founded in 2019 by a group of food enthusiasts, we started as a 
                    small burger restaurant in the heart of Bole, Addis Ababa.
                  </p>
                  <p>
                    What began as a humble burger joint has evolved into a beloved culinary destination 
                    that celebrates both international flavors and Ethiopian hospitality. We believe 
                    that food is more than sustenance—it's a way to connect, celebrate, and create 
                    lasting memories.
                  </p>
                  <p>
                    Today, with three locations across Addis Ababa and a commitment to quality that 
                    never wavers, we continue to serve our community with passion, innovation, and 
                    the warmest Ethiopian welcome.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="aspect-square bg-gradient-to-br from-brand-yellow to-brand-red rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  Restaurant Interior
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-brown rounded-2xl flex items-center justify-center text-white font-bold">
                  Since 2019
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="container-responsive">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do, from sourcing ingredients to serving customers
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="container-responsive">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                The passionate people behind every delicious meal
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card text-center hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="w-32 h-32 bg-gradient-to-br from-brand-red to-brand-brown rounded-full mx-auto mb-6 flex items-center justify-center text-white text-lg font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-brand-red font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-gray-50">
          <div className="container-responsive">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From a small dream to a beloved restaurant chain
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex items-center gap-8 mb-12 ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div className="flex-1">
                    <div className={`card ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                      <div className="text-2xl font-bold text-brand-red mb-2">{item.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="w-4 h-4 bg-brand-red rounded-full flex-shrink-0 relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="py-20 bg-brand-red text-white">
          <div className="container-responsive text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6">Visit Us Today</h2>
              <p className="text-xl mb-8 opacity-90">
                Experience the taste that has made us Addis Ababa's favorite
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="flex items-center gap-2 text-lg">
                  <Phone className="w-5 h-5" />
                  +251-911-123456
                </div>
                <div className="flex items-center gap-2 text-lg">
                  <Mail className="w-5 h-5" />
                  info@keeolburger.com
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

export default AboutPage
