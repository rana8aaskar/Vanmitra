import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import FullDetailsModal from '../components/FullDetailsModal'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Filter, ChevronRight, ChevronLeft, Trees, Droplets, Mountain, Building,
  Layers, Info, ZoomIn, ZoomOut,
  Navigation, Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  User, FileText, Activity, Hash, Home as HomeIcon, CreditCard, Users,
  Globe, Gavel, UserCheck, Building2, IndianRupee, Download, X,
  Upload, BarChart3, Menu, LogOut, ChevronDown, Settings
} from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Cookies from 'js-cookie'
import { generateClaimReport, generateCSVReport } from '../utils/generateReport'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loadingClaim, setLoadingClaim] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [showFullDetails, setShowFullDetails] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const profileMenuRef = useRef(null)
  const mapFrameRef = useRef(null)

  // Filter states
  const [filters, setFilters] = useState({
    water: true,
    forest: true,
    agriculture: true,
    builtup: true,
    approved: true,
    pending: true,
    rejected: false
  })

  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      api.setAuthToken(token)
      fetchUser()
    } else {
      // Redirect to home page if not authenticated
      router.push('/')
      toast.warning('Please sign in to access the dashboard')
    }
  }, [])

  useEffect(() => {
    // Set up message listener for map interactions
    const handleMessage = async (event) => {
      console.log('Received message:', event.data)

      if (event.data.type === 'markerClick') {
        const clickedData = event.data.data
        console.log('Marker clicked data:', clickedData)
        setLoadingClaim(true)
        setRightPanelOpen(true)

        try {
          // Fetch full details from database using claimant name or coordinates
          const response = await api.getClaimDetails({
            claimantName: clickedData.claimantName || clickedData.claimant,
            lat: clickedData.lat,
            lng: clickedData.lng
          })

          if (response.success) {
            setSelectedLocation(response.data)
          } else {
            // If not found in database, use the tooltip data
            setSelectedLocation(clickedData)
          }
        } catch (error) {
          console.error('Error fetching claim details:', error)
          // Use tooltip data as fallback
          setSelectedLocation(clickedData)
          toast.error('Could not fetch full details')
        } finally {
          setLoadingClaim(false)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const fetchUser = async () => {
    try {
      const userData = await api.getMe()
      setUser(userData.user)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setShowLoginModal(true)
      setLoading(false)
    }
  }

  const handleFilterChange = (filterName) => {
    const newFilters = { ...filters, [filterName]: !filters[filterName] }
    setFilters(newFilters)

    // Send filter updates to map iframe
    if (mapFrameRef.current) {
      mapFrameRef.current.contentWindow.postMessage({
        type: 'updateFilters',
        filters: newFilters
      }, '*')
    }
  }

  // Navbar functions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
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
      toast.success('Logged in successfully!')
      setFormData({ name: '', email: '', password: '' })
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
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
    }
  }

  const handleLogout = () => {
    Cookies.remove('token')
    setUser(null)
    setShowProfileMenu(false)
    toast.success('Logged out successfully')
  }

  const getStatusIcon = (status) => {
    const statusLower = (status || '').toLowerCase()
    switch(statusLower) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getAssetTypeColor = (type) => {
    switch(type) {
      case 'water': return 'bg-blue-500'
      case 'forest': return 'bg-green-600'
      case 'agriculture': return 'bg-yellow-500'
      case 'builtup': return 'bg-red-500'
      case 'mixed': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Trees className="w-10 h-10 text-forest-600 animate-bounce" />
            <Droplets className="w-10 h-10 text-blue-600 animate-bounce" style={{ animationDelay: '0.1s' }} />
            <Mountain className="w-10 h-10 text-earth-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <h2 className="text-2xl font-bold text-forest-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">Please wait while we fetch your FRA data...</p>
          <div className="w-64 mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-forest-500 to-forest-600 h-full rounded-full" style={{
              animation: 'shimmer 2s ease-in-out infinite',
              backgroundSize: '200% 100%',
              backgroundImage: 'linear-gradient(90deg, #16a34a 0%, #22c55e 50%, #16a34a 100%)'
            }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">This may take a moment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard - Vanmitra</title>
        <meta name="description" content="Resource Management Dashboard" />
      </Head>

      {/* Enhanced Navbar - Same as Homepage */}
      <header className="fixed top-0 w-full bg-transparent backdrop-blur-0 shadow-none z-50 border-none">
        <nav className="bg-transparent backdrop-blur-0">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo Section */}
              <motion.div 
                className="flex items-center gap-4"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/" className="flex items-center gap-3 group">
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <img src="/images/vanmitra-logo.svg" alt="Vanmitra Logo" className="w-14 h-14 drop-shadow-sm" />
                    <div className="absolute inset-0 bg-forest-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </motion.div>
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-forest-800 group-hover:text-forest-600 transition-colors duration-200">VANMITRA</h1>
                    <p className="text-xs text-gray-600 group-hover:text-forest-500 transition-colors duration-200">An Initiative by Ministry of Tribal Affairs, Govt. of India</p>
                  </div>
                </Link>
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2">
                {[
                  { href: '/dashboard', label: 'Dashboard', icon: BarChart }
                ].map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link 
                      href={item.href} 
                      className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        router.pathname === item.href 
                          ? 'bg-white/20 text-white font-semibold shadow-sm' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {item.icon && <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />}
                      <span className="relative">
                        {item.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-200"></span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
                
                {user ? (
                  <motion.div 
                    className="relative ml-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="group flex items-center gap-3 bg-gradient-to-r from-forest-100 to-forest-50 text-forest-800 px-4 py-2.5 rounded-xl hover:from-forest-200 hover:to-forest-100 transition-all duration-200 shadow-sm hover:shadow-md border border-forest-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-forest-600 to-forest-700 text-white rounded-full flex items-center justify-center font-semibold shadow-sm group-hover:scale-105 transition-transform duration-200">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-sm">{user.name || 'Profile'}</span>
                        <p className="text-xs text-forest-600">Welcome back</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Profile Dropdown */}
                    <AnimatePresence>
                      {showProfileMenu && (
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
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <BarChart3 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                              <span>Dashboard</span>
                            </Link>
                            <Link
                              href="/upload"
                              className="flex items-center gap-3 px-6 py-3 text-sm text-gray-700 hover:bg-forest-50 hover:text-forest-700 transition-all duration-200 group"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <Upload className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                              <span>Upload Document</span>
                            </Link>
                            <hr className="my-2 border-gray-100" />
                            <button
                              onClick={handleLogout}
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
                    className="group flex items-center gap-2 bg-white text-forest-700 px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">Sign In</span>
                  </motion.button>
                )}
              </div>

              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-forest-50 transition-colors duration-200"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? <X className="w-6 h-6 text-forest-600" /> : <Menu className="w-6 h-6 text-forest-600" />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-transparent backdrop-blur-0 border-b-0 overflow-hidden"
            >
              <div className="container mx-auto px-4 py-6 space-y-1">
                {user && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="border-b border-forest-100 pb-4 mb-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-forest-600 to-forest-700 text-white rounded-full flex items-center justify-center font-semibold shadow-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-forest-600">{user.email}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                {[
                  { href: '/dashboard', label: 'Dashboard', icon: BarChart }
                ].map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link 
                      href={item.href}
                      className={`group flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 ${
                        router.pathname === item.href 
                          ? 'bg-white/20 text-white font-semibold' 
                          : 'text-white hover:bg-white/10'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon && <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />}
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
                {user ? (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={handleLogout}
                    className="w-full text-left py-3 px-4 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    Logout
                  </motion.button>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => {
                      setIsMenuOpen(false)
                      setShowLoginModal(true)
                    }}
                    className="w-full text-left py-3 px-4 text-forest-600 font-semibold hover:bg-forest-50 rounded-lg transition-colors duration-200"
                  >
                    Sign In
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="pt-16 h-screen flex">
        {/* Left Panel - Filters */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: leftPanelOpen ? 0 : -280 }}
          className="w-80 bg-white border-r border-gray-200 shadow-lg flex relative z-20"
        >
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-forest-600" />
                Map Filters
              </h2>

              {/* Asset Class Filters */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Asset Classes</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.water}
                      onChange={() => handleFilterChange('water')}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">Water Bodies</span>
                    </div>
                    <span className="w-4 h-4 bg-blue-500 rounded"></span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.forest}
                      onChange={() => handleFilterChange('forest')}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Trees className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Forest Areas</span>
                    </div>
                    <span className="w-4 h-4 bg-green-600 rounded"></span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.agriculture}
                      onChange={() => handleFilterChange('agriculture')}
                      className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Mountain className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-gray-700">Agriculture</span>
                    </div>
                    <span className="w-4 h-4 bg-yellow-500 rounded"></span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.builtup}
                      onChange={() => handleFilterChange('builtup')}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Building className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-gray-700">Built-up Areas</span>
                    </div>
                    <span className="w-4 h-4 bg-red-500 rounded"></span>
                  </label>
                </div>
              </div>

              {/* Status Filters */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Claim Status</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.approved}
                      onChange={() => handleFilterChange('approved')}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Approved</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.pending}
                      onChange={() => handleFilterChange('pending')}
                      className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-gray-700">Pending</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.rejected}
                      onChange={() => handleFilterChange('rejected')}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-gray-700">Rejected</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Map Controls */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Map Controls</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2 text-sm text-gray-700 transition-colors">
                    <ZoomIn className="w-4 h-4" />
                    Zoom In
                  </button>
                  <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2 text-sm text-gray-700 transition-colors">
                    <ZoomOut className="w-4 h-4" />
                    Zoom Out
                  </button>
                  <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2 text-sm text-gray-700 transition-colors">
                    <Navigation className="w-4 h-4" />
                    Reset View
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            className="absolute -right-10 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-r-lg p-2 shadow-md hover:bg-gray-50 transition-colors"
          >
            {leftPanelOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </motion.div>

        {/* Center - Map */}
        <div className="flex-1 relative">
          <iframe
            ref={mapFrameRef}
            src="/map-wrapper.html"
            className="w-full h-full border-0"
            title="Resource Map"
          />

        </div>

        {/* Right Panel - Location Details Dialog */}
        <AnimatePresence>
          {rightPanelOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-0 top-20 bottom-0 w-[480px] z-[60] p-4"
            >
              <motion.div
                initial={{ x: 500, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 500, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="h-full bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
              >
                {/* Dialog Header */}
                <div className="bg-gradient-to-r from-water-600 to-forest-600 p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Claim Details
                    </h2>
                    <button
                      onClick={() => setRightPanelOpen(false)}
                      className="p-2 bg-white/10 hover:bg-white/25 rounded-lg transition-all transform hover:scale-110 group"
                      title="Close"
                    >
                      <X className="w-6 h-6 text-white group-hover:text-white/90" />
                    </button>
                  </div>
                </div>

                {/* Dialog Body */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 72px)' }}>
                  {loadingClaim ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-forest-600"></div>
                    </div>
                  ) : selectedLocation ? (
                    <div className="space-y-4">
                      {/* Claimant Info Card */}
                      {selectedLocation.claimant_name && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{selectedLocation.claimant_name}</h3>
                              {selectedLocation.spouse_name && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Spouse: {selectedLocation.spouse_name}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                {selectedLocation.age && (
                                  <span>Age: {selectedLocation.age}</span>
                                )}
                                {selectedLocation.gender && (
                                  <span>Gender: {selectedLocation.gender}</span>
                                )}
                                {selectedLocation.category && (
                                  <span>Category: {selectedLocation.category}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Personal Information */}
                      {selectedLocation.aadhaar_no && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Identity Information
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Aadhaar No:</span>
                              <span className="font-medium">{selectedLocation.aadhaar_no}</span>
                            </div>
                            {selectedLocation.patta_title_no && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Patta Title No:</span>
                                <span className="font-medium">{selectedLocation.patta_title_no}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Location Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">State:</span>
                            <span className="font-medium">{selectedLocation.state || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">District:</span>
                            <span className="font-medium">{selectedLocation.district || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tehsil/Block:</span>
                            <span className="font-medium">{selectedLocation.tehsil || selectedLocation.block_tehsil || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Village:</span>
                            <span className="font-medium">{selectedLocation.village || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gram Panchayat:</span>
                            <span className="font-medium">{selectedLocation.gram_panchayat || 'N/A'}</span>
                          </div>
                          {selectedLocation.geo_coordinates && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Coordinates:</span>
                              <span className="font-medium text-xs">{selectedLocation.geo_coordinates}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Claim Details */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-forest-50 to-water-50 rounded-lg p-3">
                          <h3 className="text-xs font-medium text-gray-700 mb-2">Claim Type</h3>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">{selectedLocation.claim_type || selectedLocation.claimType || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3">
                          <h3 className="text-xs font-medium text-gray-700 mb-2">Land Use</h3>
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded ${getAssetTypeColor(selectedLocation.asset_type || selectedLocation.type)}`}></span>
                            <span className="text-sm font-medium capitalize">{selectedLocation.land_use || 'Unknown'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Land and Financial Info */}
                      {(selectedLocation.land_claimed || selectedLocation.annual_income) && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <IndianRupee className="w-4 h-4" />
                            Claim & Financial Details
                          </h3>
                          <div className="space-y-2 text-sm">
                            {selectedLocation.land_claimed && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Area Claimed:</span>
                                <span className="font-medium">{selectedLocation.land_claimed}</span>
                              </div>
                            )}
                            {selectedLocation.annual_income && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Annual Income:</span>
                                <span className="font-medium">{selectedLocation.annual_income}</span>
                              </div>
                            )}
                            {selectedLocation.tax_payer && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tax Payer:</span>
                                <span className="font-medium">{selectedLocation.tax_payer}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Claim Status with Progress */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Claim Status
                        </h3>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(selectedLocation.status_of_claim || selectedLocation.status)}
                            <span className="font-medium capitalize">
                              {selectedLocation.status_of_claim || selectedLocation.status || 'Unknown'}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            (selectedLocation.status_of_claim || selectedLocation.status || '').toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' :
                            (selectedLocation.status_of_claim || selectedLocation.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            (selectedLocation.status_of_claim || selectedLocation.status || '').toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {(selectedLocation.status_of_claim || selectedLocation.status || '').toLowerCase() === 'approved' ? '100% Complete' :
                             (selectedLocation.status_of_claim || selectedLocation.status || '').toLowerCase() === 'pending' ? 'In Progress' :
                             (selectedLocation.status_of_claim || selectedLocation.status || '').toLowerCase() === 'rejected' ? 'Action Required' :
                             'Not Started'}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all duration-300 ${
                            (selectedLocation.status_of_claim || selectedLocation.status || '').toLowerCase() === 'approved' ? 'bg-green-500 w-full' :
                            (selectedLocation.status_of_claim || selectedLocation.status || '').toLowerCase() === 'pending' ? 'bg-yellow-500 w-1/2' :
                            (selectedLocation.status_of_claim || selectedLocation.status || '').toLowerCase() === 'rejected' ? 'bg-red-500 w-1/4' :
                            'bg-gray-400 w-0'
                          }`}></div>
                        </div>

                        {/* Dates */}
                        <div className="mt-3 space-y-1 text-xs text-gray-600">
                          {selectedLocation.date_of_submission && (
                            <div className="flex justify-between">
                              <span>Submitted:</span>
                              <span>{formatDate(selectedLocation.date_of_submission)}</span>
                            </div>
                          )}
                          {selectedLocation.date_of_decision && (
                            <div className="flex justify-between">
                              <span>Decision Date:</span>
                              <span>{formatDate(selectedLocation.date_of_decision)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Infrastructure & Resources */}
                      {(selectedLocation.water_body || selectedLocation.irrigation_source || selectedLocation.infrastructure_present) && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            Infrastructure & Resources
                          </h3>
                          <div className="space-y-3 text-sm">
                            {selectedLocation.water_body && (
                              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Droplets className="w-3 h-3" />
                                  Water Body:
                                </span>
                                <span className="font-medium">{selectedLocation.water_body}</span>
                              </div>
                            )}
                            {selectedLocation.irrigation_source && (
                              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                <span className="text-gray-600">Irrigation:</span>
                                <span className="font-medium">{selectedLocation.irrigation_source}</span>
                              </div>
                            )}
                            {selectedLocation.infrastructure_present && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Infrastructure:</span>
                                <span className="font-medium">{selectedLocation.infrastructure_present}</span>
                              </div>
                            )}
                          </div>
            </div>
                      )}

                      {/* Verification Details */}
                      {(selectedLocation.verified_by_gram_sabha || selectedLocation.gram_sabha_chairperson) && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <UserCheck className="w-4 h-4" />
                            Verification & Authorities
                          </h3>
                          <div className="space-y-2 text-sm">
                            {selectedLocation.verified_by_gram_sabha && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Gram Sabha Verified:</span>
                                <span className={`font-medium ${
                                  selectedLocation.verified_by_gram_sabha === 'Yes' ? 'text-green-600' : 'text-red-600'
                                }`}>{selectedLocation.verified_by_gram_sabha}</span>
            </div>
                            )}
                            {selectedLocation.gram_sabha_chairperson && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Gram Sabha Chair:</span>
                                <span className="font-medium">{selectedLocation.gram_sabha_chairperson}</span>
            </div>
                            )}
                            {selectedLocation.forest_dept_officer && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Forest Officer:</span>
                                <span className="font-medium">{selectedLocation.forest_dept_officer}</span>
            </div>
                            )}
                            {selectedLocation.revenue_dept_officer && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Revenue Officer:</span>
                                <span className="font-medium">{selectedLocation.revenue_dept_officer}</span>
            </div>
                            )}
            </div>
          </div>
        )}

                      {/* Boundary Description */}
                      {selectedLocation.boundary_description && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Boundary Description
                          </h3>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {selectedLocation.boundary_description}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2 space-y-2">
                        <button
                          onClick={() => setShowFullDetails(true)}
                          className="w-full px-4 py-2.5 bg-gradient-to-r from-forest-600 to-water-600 text-white rounded-lg hover:from-forest-700 hover:to-water-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          View Full Details
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              generateClaimReport(selectedLocation)
                              toast.success('PDF Report downloaded successfully!')
                            }}
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            PDF Report
                          </button>
                          <button
                            onClick={() => {
                              generateCSVReport(selectedLocation)
                              toast.success('CSV Report downloaded successfully!')
                            }}
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            CSV Data
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Location Selected</h3>
                      <p className="text-sm text-gray-500 px-4">
                        Click on any blue marker on the map to view detailed information about that claim
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl"
            >
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-water-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplets className="w-6 h-6 text-water-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Access Dashboard</h2>
                <p className="text-sm text-gray-500 mt-1">Sign in to view your resources</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-water-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-water-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => window.location.href = '/'}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Go to Home
                  </button>
            <button
              type="submit"
                    className="flex-1 px-4 py-2 text-sm text-white bg-water-600 rounded-lg hover:bg-water-700 transition-colors"
            >
                    Sign In
            </button>
                </div>
          </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setShowLoginModal(false)
                      setShowRegisterModal(true)
                    }}
                    className="text-forest-600 hover:text-forest-700 font-medium"
                  >
                    Sign up here
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl"
            >
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trees className="w-6 h-6 text-forest-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Join Vanmitra</h2>
                <p className="text-sm text-gray-500 mt-1">Create your account</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
            </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
            </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => window.location.href = '/'}
                    className="flex-1 px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Go to Home
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm text-white bg-forest-600 rounded-lg hover:bg-forest-700 transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setShowRegisterModal(false)
                      setShowLoginModal(true)
                    }}
                    className="text-water-600 hover:text-water-700 font-medium"
                  >
                    Sign in here
                  </button>
                </p>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Details Modal */}
      <FullDetailsModal
        isOpen={showFullDetails}
        onClose={() => setShowFullDetails(false)}
        claimData={selectedLocation}
      />
    </div>
  )
}