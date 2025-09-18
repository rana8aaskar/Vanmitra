import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Trees, Users, Globe, Award, ChevronRight, MapPin, Upload, BarChart3, Brain, Satellite, ScrollText, CheckCircle, ArrowRight, Menu, X, Shield, Target, TrendingUp, FileText, Activity, Home as HomeIcon, Settings, FileSearch, Database, Clock, User, LogOut, ChevronDown, Mountain, Building } from 'lucide-react'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import Cookies from 'js-cookie'
import api from '../services/api'
import { toast } from 'react-toastify'
import { Cinzel, Playfair_Display } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['900'] })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['900'], style: ['normal', 'italic'] })

export default function Home() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const profileMenuRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  // Refs for scroll animations
  const [statsRef, statsInView] = useInView({ threshold: 0.3, triggerOnce: true })
  const [techRef, techInView] = useInView({ threshold: 0.2, triggerOnce: true })


  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      api.setAuthToken(token)
      fetchUser()
    }
  }, [])

  const fetchUser = async () => {
    try {
      const userData = await api.getMe()
      setUser(userData.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }


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

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Vanmitra - Ministry of Tribal Affairs Initiative | Forest Rights Act Portal</title>
        <meta name="description" content="Official FRA digitization portal by Ministry of Tribal Affairs, Government of India" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
      </Head>

      {/* Header with MoTA Branding */}
      <header className="fixed top-0 w-full z-50">
        <nav className="mx-8 mt-4">
          <div className="bg-white/95 backdrop-blur-md rounded-full shadow-lg px-6 py-2">
            <div className="flex items-center justify-between h-14">
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
                    <img src="/images/vanmitra-logo.svg" alt="Vanmitra Logo" className="w-12 h-12 drop-shadow-sm" />
                    <div className="absolute inset-0 bg-forest-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </motion.div>
                  <span className={`${playfair.className} text-2xl font-bold text-forest-800 tracking-wide hidden sm:block`}>
                    VANMITRA
                  </span>
                </Link>
                <div className="h-8 w-px bg-gray-300"></div>
                <img src="/images/Ministry_of_Tribal_Affairs (1).svg" alt="Ministry of Tribal Affairs" className="h-10" />
              </motion.div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2">
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
                      className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
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
                      <div className="w-8 h-8 bg-gradient-to-br from-forest-600 to-forest-700 text-white rounded-full flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform duration-200">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-base">{user.name || 'Profile'}</span>
                        <p className="text-xs font-semibold text-forest-600">Welcome back</p>
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
                    className="group flex items-center gap-2 bg-forest-600 text-white px-6 py-2.5 rounded-full hover:bg-forest-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-bold text-base">Sign In</span>
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
              className="md:hidden bg-white rounded-b-3xl shadow-lg overflow-hidden mx-8"
            >
              <div className="px-4 py-6 space-y-1">
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
                      className={`group flex items-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 ${
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{
        backgroundImage: 'url("/images/hero-forest-valley.jpg")',
        backgroundSize: '120%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Blurred Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-emerald-800/30 to-emerald-900/50 backdrop-blur-sm"></div>
        
        {/* Additional Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>


        <div className="container mx-auto px-4 relative z-10 pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Empowering Tribal Communities through the
              <span className="text-emerald-200"> Forest Rights Act</span>
          </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-md">
              Digitizing FRA records, mapping assets, and enabling data-driven development for India's forests and forest dwellers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user ? (
                <>
                  <Link href="/dashboard" className="bg-forest-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-forest-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Go to Dashboard
                  </Link>
                  <Link href="/upload" className="bg-white/20 backdrop-blur text-white border-2 border-white/50 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" />
                    Submit FRA Claim
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-forest-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-forest-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    Sign In to Continue
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="bg-white/20 backdrop-blur text-white border-2 border-white/50 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Create Account
                  </button>
                </>
              )}
          </div>

            {/* Quick Stats Bar - Over Image */}
            <div className="absolute -bottom-24 left-0 right-0">
              <div className="container mx-auto px-4">
                <div className="rounded-2xl p-6 border border-white/20">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-white drop-shadow-lg">4</p>
                      <p className="text-sm text-white/90 drop-shadow-md font-medium">Focus States</p>
                      <p className="text-xs text-white/70 mt-1">MP, Tripura, Odisha, Telangana</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-white drop-shadow-lg">FRA</p>
                      <p className="text-sm text-white/90 drop-shadow-md font-medium">Atlas & WebGIS</p>
                      <p className="text-xs text-white/70 mt-1">AI-Powered Platform</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-white drop-shadow-lg">DSS</p>
                      <p className="text-sm text-white/90 drop-shadow-md font-medium">Decision Support</p>
                      <p className="text-xs text-white/70 mt-1">Integrated Monitoring</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-white drop-shadow-lg">CSS</p>
                      <p className="text-sm text-white/90 drop-shadow-md font-medium">Scheme Integration</p>
                      <p className="text-xs text-white/70 mt-1">PM-KISAN, MGNREGA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About MoTA Block */}
      <section className="py-20 bg-gradient-to-r from-forest-50 to-earth-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/3">
                  <div className="rounded-xl p-8 text-center">
                    <img src="/images/Ministry_of_Tribal_Affairs (1).svg" alt="Ministry of Tribal Affairs" className="h-24 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-forest-800">Ministry of Tribal Affairs</h3>
                    <p className="text-sm text-forest-600 mt-2">Government of India</p>
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h2 className="text-3xl font-bold text-forest-800 mb-4">Committed to Tribal Empowerment</h2>
                  <p className="text-gray-700 mb-4">
                    The Ministry of Tribal Affairs (MoTA) is committed to the socio-economic empowerment of India's tribal communities. Through initiatives like FRA digitization, MoTA ensures transparency, justice, and access to resources for millions of forest dwellers.
                  </p>
                  <p className="text-gray-700 mb-6">
                    Our mission is to create an inclusive ecosystem where tribal communities can thrive while preserving their cultural heritage and traditional knowledge systems.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-forest-600" />
                      <span className="text-sm font-medium">Policy Implementation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-forest-600" />
                      <span className="text-sm font-medium">Digital Transformation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-forest-600" />
                      <span className="text-sm font-medium">Community Development</span>
                </div>
                </div>
                </div>
                </div>
              </div>
          </motion.div>
        </div>
      </section>

      {/* What is FRA Act */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-center text-forest-800 mb-12">
              Understanding the Forest Rights Act
            </h2>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="bg-forest-50 rounded-xl p-8">
                  <ScrollText className="w-12 h-12 text-forest-600 mb-4" />
                  <h3 className="text-2xl font-bold text-forest-800 mb-4">The Forest Rights Act, 2006</h3>
                  <p className="text-gray-700 mb-4">
                    The Forest Rights Act (FRA), 2006 recognizes the rights of forest-dwelling communities to land, resources, and sustainable livelihoods. It empowers tribal groups to legally access forest produce, farming land, and protect biodiversity.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-forest-600 mt-0.5" />
                      <span className="text-gray-700">Individual Forest Rights (IFR) for cultivation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-forest-600 mt-0.5" />
                      <span className="text-gray-700">Community Forest Rights (CFR) for resource access</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-forest-600 mt-0.5" />
                      <span className="text-gray-700">Community Rights (CR) for grazing and water bodies</span>
                    </li>
                  </ul>
                  <a href="https://tribal.nic.in/FRA.aspx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-forest-600 font-semibold hover:text-forest-700">
                    Learn More <ArrowRight className="w-4 h-4" />
                </a>
              </div>
          </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-earth-50 rounded-xl p-6 text-center">
                  <Users className="w-10 h-10 text-earth-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-earth-700">2.5Cr+</p>
                  <p className="text-sm text-gray-600">Forest Dwellers</p>
                </div>
                <div className="bg-water-50 rounded-xl p-6 text-center">
                  <Mountain className="w-10 h-10 text-water-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-water-700">40M Ha</p>
                  <p className="text-sm text-gray-600">Forest Area</p>
                </div>
                <div className="bg-forest-50 rounded-xl p-6 text-center">
                  <FileText className="w-10 h-10 text-forest-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-forest-700">42.5L</p>
                  <p className="text-sm text-gray-600">Claims Filed</p>
                </div>
                <div className="bg-earth-50 rounded-xl p-6 text-center">
                  <Award className="w-10 h-10 text-earth-600 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-earth-700">20.5L</p>
                  <p className="text-sm text-gray-600">Titles Granted</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How We Process FRA Claims */}
      <section className="py-20 bg-gradient-to-br from-forest-50 to-earth-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-forest-800 mb-4">How Vanmitra Processes FRA Claims</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI-powered platform digitizes and verifies Forest Rights Act claims through a streamlined, transparent process
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-forest-600 text-white rounded-full flex items-center justify-center font-bold text-lg">1</div>
                  <h3 className="text-xl font-bold text-forest-800 ml-3">Document Upload & OCR</h3>
                </div>
                <Upload className="w-12 h-12 text-forest-600 mb-4" />
                <p className="text-gray-700">
                  Claimants or officials upload scanned FRA documents. Our advanced OCR technology extracts text from handwritten and printed documents in multiple languages.
                </p>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-forest-600 text-white rounded-full flex items-center justify-center font-bold text-lg">2</div>
                  <h3 className="text-xl font-bold text-forest-800 ml-3">AI Verification & Analysis</h3>
                </div>
                <Brain className="w-12 h-12 text-forest-600 mb-4" />
                <p className="text-gray-700">
                  Our AI models verify claim authenticity, detect duplicates, and analyze eligibility criteria against FRA guidelines. Machine learning ensures accurate classification.
                </p>
              </motion.div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-forest-600 text-white rounded-full flex items-center justify-center font-bold text-lg">3</div>
                  <h3 className="text-xl font-bold text-forest-800 ml-3">Satellite Mapping</h3>
                </div>
                <Satellite className="w-12 h-12 text-forest-600 mb-4" />
                <p className="text-gray-700">
                  Claimed land parcels are verified using satellite imagery. We detect forest cover, water bodies, and land use patterns to validate claims geospatially.
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Step 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-forest-600 text-white rounded-full flex items-center justify-center font-bold text-lg">4</div>
                  <h3 className="text-xl font-bold text-forest-800 ml-3">DSS Recommendations</h3>
                </div>
                <Target className="w-12 h-12 text-forest-600 mb-4" />
                <p className="text-gray-700">
                  Our Decision Support System analyzes socio-economic data to recommend eligible beneficiaries for government schemes like PM-KISAN, MGNREGA, and Jal Jeevan Mission.
                </p>
              </motion.div>

              {/* Step 5 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-forest-600 text-white rounded-full flex items-center justify-center font-bold text-lg">5</div>
                  <h3 className="text-xl font-bold text-forest-800 ml-3">Dashboard & Reports</h3>
                </div>
                <BarChart3 className="w-12 h-12 text-forest-600 mb-4" />
                <p className="text-gray-700">
                  Officials access real-time dashboards showing claim status, analytics, and geographic distribution. Automated reports help in policy decisions and resource allocation.
                </p>
              </motion.div>
            </div>

            {/* Key Features */}
            <div className="mt-12 bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-forest-800 mb-6 text-center">Key Features of Our Platform</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-forest-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-forest-800">Multi-Language Support</h4>
                    <p className="text-gray-600 text-sm">Process documents in Hindi, English, and 10+ regional languages</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-forest-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-forest-800">99.5% Accuracy</h4>
                    <p className="text-gray-600 text-sm">AI-powered verification with minimal false positives</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-forest-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-forest-800">Real-time Processing</h4>
                    <p className="text-gray-600 text-sm">Claims processed within 24-48 hours of submission</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-forest-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-forest-800">Secure & Compliant</h4>
                    <p className="text-gray-600 text-sm">End-to-end encryption with government data protection standards</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI + Tech Section */}
      <section ref={techRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={techInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-forest-800 mb-4">Technology for Transformation</h2>
              <p className="text-xl text-gray-600">Leveraging cutting-edge AI and satellite technology for tribal empowerment</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={techInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-forest-50 to-forest-100 rounded-xl p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <ScrollText className="w-12 h-12 text-forest-600 mb-4" />
                <h3 className="text-xl font-bold text-forest-800 mb-2">Digitization</h3>
                <p className="text-gray-600 text-sm">Extracting text from scanned FRA records using OCR and NLP</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={techInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-water-50 to-water-100 rounded-xl p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <Satellite className="w-12 h-12 text-water-600 mb-4" />
                <h3 className="text-xl font-bold text-water-800 mb-2">Satellite AI Mapping</h3>
                <p className="text-gray-600 text-sm">Detecting land, water, and forest assets using remote sensing</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={techInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-earth-50 to-earth-100 rounded-xl p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <Globe className="w-12 h-12 text-earth-600 mb-4" />
                <h3 className="text-xl font-bold text-earth-800 mb-2">WebGIS Portal</h3>
                <p className="text-gray-600 text-sm">Explore FRA claims in real-time with interactive maps</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={techInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-forest-50 to-earth-50 rounded-xl p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <Brain className="w-12 h-12 text-forest-600 mb-4" />
                <h3 className="text-xl font-bold text-forest-800 mb-2">DSS Engine</h3>
                <p className="text-gray-600 text-sm">AI recommendations for PM-KISAN, Jal Jeevan Mission integration</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Get Involved Section */}
      <section className="py-20 bg-gradient-to-br from-forest-600 to-earth-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-4">Get Involved</h2>
            <p className="text-xl mb-8 text-white/90">
              Join us in our mission to empower tribal communities and protect forest rights
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <Users className="w-12 h-12 mx-auto mb-3 text-white/80" />
                <h3 className="text-xl font-semibold mb-2">NGOs & CBOs</h3>
                <p className="text-sm text-white/80 mb-4">Partner with us to reach more communities</p>
                <button className="text-white underline hover:no-underline">Join as Partner</button>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <Building className="w-12 h-12 mx-auto mb-3 text-white/80" />
                <h3 className="text-xl font-semibold mb-2">State Departments</h3>
                <p className="text-sm text-white/80 mb-4">Integrate your FRA data with national portal</p>
                <button className="text-white underline hover:no-underline">Learn More</button>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <Globe className="w-12 h-12 mx-auto mb-3 text-white/80" />
                <h3 className="text-xl font-semibold mb-2">Communities</h3>
                <p className="text-sm text-white/80 mb-4">Submit claims and track your applications</p>
                <button className="text-white underline hover:no-underline">Get Started</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload" className="bg-white text-forest-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Legacy Data
              </Link>
              <Link href="/contact" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-forest-700 transition-colors inline-flex items-center gap-2">
                <Users className="w-5 h-5" />
                Partner with MoTA
              </Link>
                </div>
          </motion.div>
                </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-8 h-8" />
                <div>
                  <p className="font-bold">Ministry of Tribal Affairs</p>
                  <p className="text-xs text-forest-300">Government of India</p>
                </div>
              </div>
              <p className="text-sm text-forest-200">
                Empowering tribal communities through technology and policy implementation.
              </p>
                </div>

                <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-forest-200">
                <li><Link href="/fra-act" className="hover:text-white">FRA Act 2006</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">FRA Atlas</Link></li>
                <li><Link href="/upload" className="hover:text-white">Submit Claim</Link></li>
                <li><Link href="/impact" className="hover:text-white">Impact Dashboard</Link></li>
              </ul>
                </div>

                <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-forest-200">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Access</a></li>
                <li><a href="#" className="hover:text-white">Training Materials</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
              </ul>
                </div>

                <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-forest-200">
                <li><a href="https://tribal.nic.in" target="_blank" rel="noopener noreferrer" className="hover:text-white">Official Website</a></li>
                <li><a href="#" className="hover:text-white">Twitter @MoTA_India</a></li>
                <li><a href="#" className="hover:text-white">MyGov India</a></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
                </div>
              </div>

          <div className="border-t border-forest-700 pt-8 text-center">
            <p className="text-sm text-forest-300">
              © 2024 Vanmitra - An Initiative by Ministry of Tribal Affairs, Government of India. All rights reserved.
            </p>
            <div className="mt-4 flex justify-center gap-6 text-xs text-forest-400">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Use</a>
              <a href="#" className="hover:text-white">RTI</a>
              <a href="#" className="hover:text-white">Accessibility</a>
            </div>
              </div>
            </div>
      </footer>

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
                  <User className="w-8 h-8 text-white" />
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
    </div>
  )
}