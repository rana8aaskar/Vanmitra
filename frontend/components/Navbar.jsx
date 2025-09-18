import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { Trees, Menu, X, Shield, LogOut, User as UserIcon, LayoutDashboard, MapPin, Upload, FileText, BarChart3, Phone } from 'lucide-react'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import api from '../services/api'

export default function Navbar({ user, setUser }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

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
      toast.success('Logged in successfully!')
      setFormData({ name: '', email: '', password: '' })

      // Redirect to dashboard after login
      if (router.pathname === '/') {
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed')
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
      toast.success('Registered successfully!')
      setFormData({ name: '', email: '', password: '' })

      // Redirect to dashboard after registration
      if (router.pathname === '/') {
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
    }
  }

  const handleLogout = () => {
    Cookies.remove('token')
    api.setAuthToken(null)
    setUser(null)
    toast.success('Logged out successfully')
    router.push('/')
  }

  const isActive = (path) => router.pathname === path

  return (
    <>
      <header className="fixed top-0 w-full bg-white shadow-md z-50">
        {/* Government Header */}
        <div className="bg-forest-800 text-white py-1">
          <div className="container mx-auto px-4 text-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>भारत सरकार | Government of India</span>
              <span className="hidden sm:inline">जनजातीय कार्य मंत्रालय | Ministry of Tribal Affairs</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/hi" className="hover:underline">हिंदी</Link>
              <span>|</span>
              <Link href="/en" className="hover:underline">English</Link>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="bg-white border-b-2 border-forest-600">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo Section */}
              <Link href="/" className="flex items-center gap-4">
                {/* Vanmitra Logo */}
                <div className="flex items-center gap-3">
                  <img src="/images/vanmitra-logo.svg" alt="Vanmitra Logo" className="w-12 h-12" />
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-forest-800">VANMITRA</h1>
                    <p className="text-xs text-gray-600">An Initiative by Ministry of Tribal Affairs, Govt. of India</p>
                  </div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                <Link
                  href="/"
                  className={`transition-colors ${isActive('/') ? 'text-forest-800 font-semibold' : 'text-gray-700 hover:text-forest-600'}`}
                >
                  Home
                </Link>
                <Link
                  href="/fra-act"
                  className={`transition-colors ${isActive('/fra-act') ? 'text-forest-800 font-semibold' : 'text-gray-700 hover:text-forest-600'}`}
                >
                  FRA Act
                </Link>
                <Link
                  href="/dashboard"
                  className={`transition-colors ${isActive('/dashboard') ? 'text-forest-800 font-semibold' : 'text-gray-700 hover:text-forest-600'}`}
                >
                  FRA Atlas
                </Link>
                <Link
                  href="/upload"
                  className={`transition-colors ${isActive('/upload') ? 'text-forest-800 font-semibold' : 'text-gray-700 hover:text-forest-600'}`}
                >
                  Upload
                </Link>
                <Link
                  href="/impact"
                  className={`transition-colors ${isActive('/impact') ? 'text-forest-800 font-semibold' : 'text-gray-700 hover:text-forest-600'}`}
                >
                  Impact
                </Link>
                <Link
                  href="/contact"
                  className={`transition-colors ${isActive('/contact') ? 'text-forest-800 font-semibold' : 'text-gray-700 hover:text-forest-600'}`}
                >
                  Contact
                </Link>

                {/* User Menu */}
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 bg-forest-600 text-white px-4 py-2 rounded-md hover:bg-forest-700 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>{user.name || 'User'}</span>
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                        >
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              setShowUserMenu(false)
                              handleLogout()
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-forest-600 text-white px-4 py-2 rounded-md hover:bg-forest-700 transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              className="md:hidden bg-white border-b overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                <Link
                  href="/"
                  className={`block py-2 ${isActive('/') ? 'text-forest-800 font-semibold' : 'text-gray-700'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/fra-act"
                  className={`block py-2 ${isActive('/fra-act') ? 'text-forest-800 font-semibold' : 'text-gray-700'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  FRA Act
                </Link>
                <Link
                  href="/dashboard"
                  className={`block py-2 ${isActive('/dashboard') ? 'text-forest-800 font-semibold' : 'text-gray-700'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  FRA Atlas
                </Link>
                <Link
                  href="/upload"
                  className={`block py-2 ${isActive('/upload') ? 'text-forest-800 font-semibold' : 'text-gray-700'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Upload
                </Link>
                <Link
                  href="/impact"
                  className={`block py-2 ${isActive('/impact') ? 'text-forest-800 font-semibold' : 'text-gray-700'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Impact
                </Link>
                <Link
                  href="/contact"
                  className={`block py-2 ${isActive('/contact') ? 'text-forest-800 font-semibold' : 'text-gray-700'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>

                {user ? (
                  <>
                    <div className="border-t pt-2 mt-2">
                      <Link
                        href="/dashboard"
                        className="block py-2 text-gray-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleLogout()
                        }}
                        className="block py-2 text-gray-700 w-full text-left"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      setShowLoginModal(true)
                    }}
                    className="block py-2 text-forest-600 font-semibold w-full text-left"
                  >
                    Login
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

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