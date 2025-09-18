import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { Trees, Menu, X, LogOut, User as UserIcon, Upload, FileText, BarChart3, ChevronDown } from 'lucide-react'
import Cookies from 'js-cookie'
import { showToast } from './CustomToast'
import api from '../services/api'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['900'], style: ['normal', 'italic'] })

export default function Navbar({ user, setUser }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const profileMenuRef = useRef(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await api.login(formData.email, formData.password)
      Cookies.set('token', response.token, { expires: 7 })
      api.setAuthToken(response.token)
      setUser(response.user)
      setShowLoginModal(false)
      showToast.login('Welcome Back!', `Logged in as ${response.user?.name || response.user?.email}`)
      setFormData({ name: '', email: '', password: '' })

      // Redirect to dashboard after login
      if (router.pathname === '/') {
        router.push('/dashboard')
      }
    } catch (error) {
      showToast.error('Login Failed', error.response?.data?.error || 'Please check your credentials')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const response = await api.register(formData.name, formData.email, formData.password)
      Cookies.set('token', response.token, { expires: 7 })
      api.setAuthToken(response.token)
      setUser(response.user)
      setShowRegisterModal(false)
      showToast.register('Welcome to Vanmitra!', 'Your account has been created successfully')
      setFormData({ name: '', email: '', password: '' })

      // Redirect to dashboard after registration
      if (router.pathname === '/') {
        router.push('/dashboard')
      }
    } catch (error) {
      showToast.error('Registration Failed', error.response?.data?.error || 'Please try again')
    }
  }

  const handleLogout = () => {
    Cookies.remove('token')
    api.setAuthToken(null)
    setUser(null)
    showToast.info('Goodbye!', 'You have been logged out successfully')
    router.push('/')
  }

  const isActive = (path) => router.pathname === path

  return (
    <>
      <header className="fixed top-0 w-full z-50">
        <nav className="mx-8 mt-4">
          <div className="bg-white/95 backdrop-blur-md rounded-full shadow-lg px-6 py-2">
            <div className="flex items-center justify-between h-14 relative">
              {/* Left Section - Logo and Ministry */}
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3 group">
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <img src="/images/vanmitra-logo.svg" alt="Vanmitra Logo" className="w-12 h-12 drop-shadow-sm" />
                    <div className="absolute inset-0 bg-forest-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </motion.div>
                </Link>
                <div className="h-8 w-px bg-gray-300"></div>
                <img src="/images/Ministry_of_Tribal_Affairs (1).svg" alt="Ministry of Tribal Affairs" className="h-10" />
              </div>

              {/* Center Section - Vanmitra Title */}
              <motion.div
                className="absolute left-1/2 transform -translate-x-1/2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <span className={`${playfair.className} text-2xl font-bold text-forest-800 tracking-wide`}>
                  VANMITRA
                </span>
              </motion.div>

              {/* Right Section - Navigation */}
              <div className="hidden md:flex items-center gap-2 justify-end">
                {user && [
                  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
                  { href: '/upload', label: 'Upload', icon: Upload }
                ].map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                        router.pathname === item.href
                          ? 'bg-forest-600 text-white font-bold shadow-sm'
                          : 'text-forest-700 font-semibold hover:bg-forest-50'
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />}
                      <span className="relative text-base">
                        {item.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-forest-600 group-hover:w-full transition-all duration-200"></span>
                      </span>
                    </Link>
                  </motion.div>
                ))}

                {/* User Menu */}
                {user ? (
                  <motion.div
                    className="relative ml-4"
                    ref={profileMenuRef}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="group flex items-center gap-3 bg-gradient-to-r from-forest-100 to-forest-50 text-forest-800 px-4 py-2.5 rounded-xl hover:from-forest-200 hover:to-forest-100 transition-all duration-200 shadow-sm hover:shadow-md border border-forest-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-forest-600 to-forest-700 text-white rounded-full flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform duration-200">
                        {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-base">{user.name || 'Profile'}</span>
                        <p className="text-xs font-semibold text-forest-600">Welcome back</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 backdrop-blur-sm"
                        >
                          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-forest-50 to-forest-100">
                            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-forest-600">{user.email}</p>
                          </div>
                          <div className="py-2">
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-3 px-6 py-3 text-sm text-gray-700 hover:bg-forest-50 hover:text-forest-700 transition-all duration-200 group"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                              <span>Dashboard</span>
                            </Link>
                            <Link
                              href="/upload"
                              className="flex items-center gap-3 px-6 py-3 text-sm text-gray-700 hover:bg-forest-50 hover:text-forest-700 transition-all duration-200 group"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Upload className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                              <span>Upload Document</span>
                            </Link>
                            <hr className="my-2 border-gray-100" />
                            <button
                              onClick={() => {
                                setShowUserMenu(false)
                                handleLogout()
                              }}
                              className="flex items-center gap-3 px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left group"
                            >
                              <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => setShowLoginModal(true)}
                    className="group flex items-center gap-2 bg-forest-600 text-white px-6 py-2.5 rounded-full hover:bg-forest-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UserIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-bold text-base">Sign In</span>
                  </motion.button>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-forest-50 transition-colors duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6 text-forest-600" /> : <Menu className="w-6 h-6 text-forest-600" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="md:hidden bg-white rounded-b-3xl shadow-lg overflow-hidden mx-8"
            >
              <div className="px-4 py-6 space-y-1">
                {user && [
                  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
                  { href: '/upload', label: 'Upload', icon: Upload }
                ].map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 py-3 px-4 rounded-full transition-all duration-200 ${
                        router.pathname === item.href
                          ? 'bg-forest-600 text-white font-semibold'
                          : 'text-forest-700 hover:bg-forest-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon && <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />}
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}

                {user ? (
                  <div className="border-t border-forest-100 pt-4 mt-4">
                    <div className="flex items-center gap-3 px-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-forest-600 to-forest-700 text-white rounded-full flex items-center justify-center font-semibold shadow-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-forest-600">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full text-left py-3 px-4 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      setShowLoginModal(true)
                    }}
                    className="w-full text-left py-3 px-4 text-forest-600 font-semibold hover:bg-forest-50 rounded-lg transition-colors duration-200"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-24"></div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-forest-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-forest-800">Welcome Back</h2>
                <p className="text-gray-600 mt-2">Sign in to access FRA Portal</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  New to Vanmitra?{' '}
                  <button
                    onClick={() => {
                      setShowLoginModal(false)
                      setShowRegisterModal(true)
                    }}
                    className="text-forest-600 hover:text-forest-700 font-semibold"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowRegisterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-forest-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trees className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-forest-800">Join Vanmitra</h2>
                <p className="text-gray-600 mt-2">Create account to access FRA services</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setShowRegisterModal(false)
                      setShowLoginModal(true)
                    }}
                    className="text-forest-600 hover:text-forest-700 font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}