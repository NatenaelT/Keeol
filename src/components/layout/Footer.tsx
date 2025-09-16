'use client'

import Link from 'next/link'
import { 
  Phone, 
  MapPin, 
  Clock, 
  Mail, 
  ChefHat,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Story', href: '/story' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Order Tracking', href: '/track' },
      { name: 'Refund Policy', href: '/refund' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Accessibility', href: '/accessibility' },
    ],
  }

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Telegram', href: '#', icon: MessageCircle },
  ]

  const locations = [
    {
      name: 'Bole Branch',
      address: 'Bole Road, Near Edna Mall',
      phone: '+251-911-123456',
      hours: '24/7',
    },
    {
      name: 'Kazanchis Branch', 
      address: 'Kazanchis, Commercial Area',
      phone: '+251-911-654321',
      hours: '6:00 AM - 11:00 PM',
    },
    {
      name: 'Piassa Branch',
      address: 'Piassa, Central District',
      phone: '+251-911-789012',
      hours: '6:00 AM - 10:00 PM',
    },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container-responsive py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-brand-red rounded-lg flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">keol</h2>
                <p className="text-sm text-gray-400">& Pizza House</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              Serving delicious burgers and pizzas with authentic Ethiopian flavors. 
              Quality ingredients, fast delivery, and exceptional service since 2020.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand-red transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-brand-red mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">24/7 Hotline</p>
                  <p className="text-gray-400 text-sm">+251-911-123456</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-brand-red mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Email Support</p>
                  <p className="text-gray-400 text-sm">support@keol.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-brand-red mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Head Office</p>
                  <p className="text-gray-400 text-sm">Bole Road, Addis Ababa</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Locations Section */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <h3 className="text-2xl font-bold text-center mb-8">Our Locations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {locations.map((location, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors duration-200"
              >
                <h4 className="text-lg font-semibold mb-3 text-brand-secondary">
                  {location.name}
                </h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{location.address}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{location.phone}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{location.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-400 text-sm mb-6">
              Get the latest offers and updates delivered to your phone via Telegram
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent text-white placeholder-gray-400"
              />
              <button className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              We'll send you promotions and order updates via Telegram
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-responsive py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} keol. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
