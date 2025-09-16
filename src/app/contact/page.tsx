'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageCircle,
  Star,
  Users,
  Navigation
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LiveChat from '@/components/chat/LiveChat'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const locations = [
    {
      name: 'Bole Branch (Main)',
      address: 'Bole Road, Near Edna Mall, Addis Ababa',
      phone: '+251-911-123456',
      email: 'bole@keol.com',
      hours: {
        weekdays: '24/7',
        weekend: '24/7'
      },
      features: ['24/7 Service', 'Dine-in', 'Takeaway', 'Delivery', 'Drive-through'],
      coordinates: { lat: 9.0192, lng: 38.7525 }
    },
    {
      name: 'Kazanchis Branch',
      address: 'Kazanchis, Commercial Area, Addis Ababa',
      phone: '+251-911-654321',
      email: 'kazanchis@keol.com',
      hours: {
        weekdays: '6:00 AM - 11:00 PM',
        weekend: '7:00 AM - 12:00 AM'
      },
      features: ['Dine-in', 'Takeaway', 'Delivery', 'Business Lunch'],
      coordinates: { lat: 9.0355, lng: 38.7469 }
    },
    {
      name: 'Piassa Branch',
      address: 'Piassa, Central District, Addis Ababa',
      phone: '+251-911-789012',
      email: 'piassa@keol.com',
      hours: {
        weekdays: '6:00 AM - 10:00 PM',
        weekend: '7:00 AM - 11:00 PM'
      },
      features: ['Dine-in', 'Takeaway', 'Delivery', 'Cultural Events'],
      coordinates: { lat: 9.0422, lng: 38.7369 }
    }
  ]

  const contactMethods = [
    {
      icon: Phone,
      title: 'Call Us',
      description: '24/7 Customer Support',
      detail: '+251-911-123456',
      action: 'tel:+251911123456'
    },
    {
      icon: Mail,
      title: 'Email Us',
      description: 'We respond within 2 hours',
      detail: 'support@keol.com',
      action: 'mailto:support@keol.com'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Instant support available',
      detail: 'Chat with us now',
      action: '#'
    }
  ]

  const faqs = [
    {
      question: 'What are your delivery hours?',
      answer: 'We deliver 24/7 from our Bole branch, and until 11 PM from other locations.'
    },
    {
      question: 'Do you offer vegetarian options?',
      answer: 'Yes! We have a variety of vegetarian burgers, pizzas, and sides clearly marked on our menu.'
    },
    {
      question: 'How can I track my order?',
      answer: 'You can track your order in real-time through our website or mobile app using your order number.'
    },
    {
      question: 'Do you cater for events?',
      answer: 'Yes, we provide catering services for corporate events, parties, and special occasions. Contact us for details.'
    }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In production, send to actual API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Message sent successfully! We\'ll get back to you soon.')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-brand-red to-brand-black text-white py-16">
          <div className="container-responsive text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Contact Us</h1>
              <p className="text-xl mb-8 opacity-90">
                We'd love to hear from you. Get in touch with us!
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16">
          <div className="container-responsive">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            >
              {contactMethods.map((method, index) => (
                <div key={index} className="card text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 bg-brand-red rounded-full flex items-center justify-center mx-auto mb-6">
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{method.title}</h3>
                  <p className="text-gray-600 mb-4">{method.description}</p>
                  <a
                    href={method.action}
                    className="text-brand-red font-medium hover:text-brand-red-dark transition-colors duration-200"
                  >
                    {method.detail}
                  </a>
                </div>
              ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="card">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="input-field"
                          placeholder="+251 91 123 4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="input-field"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="order">Order Support</option>
                        <option value="catering">Catering Services</option>
                        <option value="feedback">Feedback</option>
                        <option value="complaint">Complaint</option>
                        <option value="partnership">Partnership</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="input-field resize-none"
                        placeholder="Tell us how we can help you..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="loading-spinner w-5 h-5"></div>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>

              {/* Locations */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Locations</h2>
                {locations.map((location, index) => (
                  <div key={index} className="card">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-brand-red mt-0.5" />
                        <span className="text-gray-600">{location.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-brand-red" />
                        <a href={`tel:${location.phone}`} className="text-gray-600 hover:text-brand-red">
                          {location.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-brand-red" />
                        <a href={`mailto:${location.email}`} className="text-gray-600 hover:text-brand-red">
                          {location.email}
                        </a>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-brand-red mt-0.5" />
                        <div className="text-gray-600">
                          <div>Mon-Fri: {location.hours.weekdays}</div>
                          <div>Sat-Sun: {location.hours.weekend}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Services Available:</h4>
                      <div className="flex flex-wrap gap-2">
                        {location.features.map((feature, idx) => (
                          <span key={idx} className="bg-brand-red/10 text-brand-red px-2 py-1 rounded-full text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full btn-outline text-sm flex items-center justify-center gap-2">
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </button>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container-responsive">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Quick answers to common questions. Can't find what you're looking for? Contact us directly.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="py-16 bg-brand-red text-white">
          <div className="container-responsive text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-4">Need Immediate Help?</h2>
              <p className="text-xl mb-8 opacity-90">
                Our 24/7 customer support team is always ready to assist you
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a
                  href="tel:+251911123456"
                  className="btn-secondary flex items-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call Now: +251-911-123456
                </a>
                <span className="text-brand-secondary">or</span>
                <button className="btn-outline border-white text-white hover:bg-white hover:text-brand-red flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Start Live Chat
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
      <LiveChat />
    </div>
  )
}

export default ContactPage
