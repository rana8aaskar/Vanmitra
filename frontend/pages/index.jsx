import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Trees, Droplets, Mountain, Building, Users, Globe, Award, ChevronRight, MapPin, Upload, BarChart3, Brain, Satellite, ScrollText, CheckCircle, ArrowRight, Menu, X, Shield, Target, TrendingUp, FileText, Activity, Layers, Navigation, Clock, User, LogOut, ChevronDown } from 'lucide-react'
import CountUp from 'react-countup'
import { useInView } from 'react-intersection-observer'
import Cookies from 'js-cookie'
import api from '../services/api'
import { toast } from 'react-toastify'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeStory, setActiveStory] = useState(0)
  const [user, setUser] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  // Refs for scroll animations
  const [statsRef, statsInView] = useInView({ threshold: 0.3, triggerOnce: true })
  const [techRef, techInView] = useInView({ threshold: 0.2, triggerOnce: true })
  const [storiesRef, storiesInView] = useInView({ threshold: 0.2, triggerOnce: true })

  const successStories = [
    {
      village: "Mendha Lekha, Maharashtra",
      title: "First Village to Get Community Forest Rights",
      quote: "With FRA, our village gained access to 1,800 hectares of forest land for sustainable management.",
      beneficiaries: "450 families",
      area: "1,800 hectares"
    },
    {
      village: "Pakur District, Jharkhand",
      title: "Empowering Santhal Tribes Through FRA",
      quote: "Forest rights have transformed our lives. We can now legally collect tendu leaves and manage our forests.",
      beneficiaries: "2,300 families",
      area: "3,200 hectares"
    },
    {
      village: "Rayagada, Odisha",
      title: "Women-Led Forest Conservation",
      quote: "FRA titles gave us the power to protect our forests from mining and preserve our traditional practices.",
      beneficiaries: "180 families",
      area: "850 hectares"
    }
  ]

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
    const interval = setInterval(() => {
      setActiveStory((prev) => (prev + 1) % successStories.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header with MoTA Branding */}
      <header className="fixed top-0 w-full bg-white shadow-md z-50">
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

        <nav className="bg-white border-b-2 border-forest-600">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo Section */}
              <div className="flex items-center gap-4">
                {/* Ashoka Emblem */}
                <div className="w-12 h-12 bg-forest-700 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>

                {/* Vanmitra Logo and Text */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Trees className="w-8 h-8 text-forest-600" />
                    <h1 className="text-2xl font-bold text-forest-800">VANMITRA</h1>
                  </div>
                  <p className="text-xs text-gray-600">An Initiative by Ministry of Tribal Affairs, Govt. of India</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                <Link href="/" className="text-forest-800 font-semibold hover:text-forest-600 transition-colors">Home</Link>
                <Link href="/fra-act" className="text-gray-700 hover:text-forest-600 transition-colors">FRA Act</Link>
                <Link href="/dashboard" className="text-gray-700 hover:text-forest-600 transition-colors">FRA Atlas</Link>
                <Link href="/upload" className="text-gray-700 hover:text-forest-600 transition-colors">Upload</Link>
                <Link href="/dashboard" className="text-gray-700 hover:text-forest-600 transition-colors">Dashboard</Link>
                <Link href="/impact" className="text-gray-700 hover:text-forest-600 transition-colors">Impact</Link>
                <Link href="/contact" className="text-gray-700 hover:text-forest-600 transition-colors">Contact</Link>
                {user ? (
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2 bg-forest-100 text-forest-800 px-3 py-2 rounded-full hover:bg-forest-200 transition-colors"
                    >
                      <div className="w-8 h-8 bg-forest-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                      <span className="font-medium">{user.name || 'Profile'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                      >
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <BarChart3 className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/upload"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-forest-50 hover:text-forest-700 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Upload className="w-4 h-4" />
                          Upload Document
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <Link href="/dashboard" className="bg-forest-600 text-white px-4 py-2 rounded-md hover:bg-forest-700 transition-colors flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
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
                {user && (
                  <div className="border-b pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-forest-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                <Link href="/" className="block py-2 text-forest-800 font-semibold">Home</Link>
                <Link href="/fra-act" className="block py-2 text-gray-700">FRA Act</Link>
                <Link href="/dashboard" className="block py-2 text-gray-700">FRA Atlas</Link>
                <Link href="/upload" className="block py-2 text-gray-700">Upload</Link>
                <Link href="/dashboard" className="block py-2 text-gray-700">Dashboard</Link>
                <Link href="/impact" className="block py-2 text-gray-700">Impact</Link>
                <Link href="/contact" className="block py-2 text-gray-700">Contact</Link>
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 text-red-600 font-semibold"
                  >
                    Logout
                  </button>
                ) : (
                  <Link href="/dashboard" className="block py-2 text-forest-600 font-semibold">
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden mt-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-forest-50 via-white to-earth-50"></div>

        {/* Floating Elements */}
        <motion.div
          style={{ y }}
          className="absolute top-20 left-20 text-forest-200 opacity-20"
        >
          <Trees className="w-32 h-32" />
        </motion.div>
        <motion.div
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -30]) }}
          className="absolute bottom-20 right-20 text-water-200 opacity-20"
        >
          <Droplets className="w-24 h-24" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-forest-800 mb-6 leading-tight">
              Empowering Tribal Communities through the
              <span className="text-forest-600"> Forest Rights Act</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Digitizing FRA records, mapping assets, and enabling data-driven development for India's forests and forest dwellers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/dashboard" className="bg-forest-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-forest-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" />
                Explore FRA Atlas
              </Link>
              <Link href="/upload" className="bg-earth-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-earth-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                Submit FRA Claim
              </Link>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-xl shadow-lg p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-forest-600">28</p>
                <p className="text-sm text-gray-600">States Covered</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-forest-600">40L+</p>
                <p className="text-sm text-gray-600">Claims Processed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-forest-600">1.2L</p>
                <p className="text-sm text-gray-600">Villages</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-forest-600">85%</p>
                <p className="text-sm text-gray-600">Satellite Verified</p>
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
                  <div className="bg-forest-100 rounded-xl p-8 text-center">
                    <Shield className="w-20 h-20 text-forest-700 mx-auto mb-4" />
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
                  <Link href="/fra-act" className="inline-flex items-center gap-2 text-forest-600 font-semibold hover:text-forest-700">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Link>
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

      {/* Interactive FRA Atlas Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-forest-800 mb-4">Interactive FRA Atlas</h2>
              <p className="text-xl text-gray-600">Explore forest rights claims across India in real-time</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-forest-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6" />
                  <span className="font-semibold">WebGIS Portal - Live Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Filter by:</span>
                  <select className="bg-forest-700 px-3 py-1 rounded text-sm">
                    <option>All States</option>
                    <option>Maharashtra</option>
                    <option>Odisha</option>
                    <option>Chhattisgarh</option>
                  </select>
                </div>
              </div>

              {/* Map Preview */}
              <div className="relative h-96 bg-gray-100">
                <iframe
                  src="/map-wrapper.html"
                  className="w-full h-full"
                  style={{ border: 'none' }}
                />
                <div className="absolute top-4 right-4">
                  <Link href="/dashboard" className="bg-white text-forest-600 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow inline-flex items-center gap-2 text-sm font-semibold">
                    <Layers className="w-4 h-4" />
                    Open Full Atlas
                  </Link>
                </div>
              </div>

              <div className="p-6 bg-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Forest Cover</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Water Bodies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Agricultural Land</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Settlements</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Impact Stats */}
      <section ref={statsRef} className="py-20 bg-gradient-to-br from-forest-600 to-forest-800 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={statsInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Impact at Scale</h2>
              <p className="text-xl text-forest-100">Real-time statistics powered by AI and satellite technology</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-3 text-forest-300" />
                <div className="text-4xl font-bold mb-2">
                  {statsInView && <CountUp end={4000000} duration={2.5} separator="," suffix="+" />}
                </div>
                <p className="text-sm text-forest-100">FRA Claims Digitized</p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-3 text-forest-300" />
                <div className="text-4xl font-bold mb-2">
                  {statsInView && <CountUp end={120000} duration={2.5} separator="," suffix="+" />}
                </div>
                <p className="text-sm text-forest-100">Villages Covered</p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                <Award className="w-8 h-8 mx-auto mb-3 text-forest-300" />
                <div className="text-4xl font-bold mb-2">
                  {statsInView && <CountUp end={2500} duration={2.5} separator="," suffix="+" />}
                </div>
                <p className="text-sm text-forest-100">Community Rights Granted</p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
                <Satellite className="w-8 h-8 mx-auto mb-3 text-forest-300" />
                <div className="text-4xl font-bold mb-2">
                  {statsInView && <CountUp end={85} duration={2.5} suffix="%" />}
                </div>
                <p className="text-sm text-forest-100">Satellite Mapped & Verified</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-3 text-forest-300" />
              <p className="text-lg">
                With AI & Remote Sensing, we aim to increase FRA coverage by <span className="text-2xl font-bold">3x</span> in the next 5 years
              </p>
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

      {/* Success Stories Carousel */}
      <section ref={storiesRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={storiesInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-forest-800 mb-4">Success Stories</h2>
              <p className="text-xl text-gray-600">Real impact in tribal communities across India</p>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStory}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="grid md:grid-cols-2">
                    <div className="bg-gradient-to-br from-forest-100 to-earth-100 p-8 md:p-12 flex items-center">
                      <div>
                        <h3 className="text-2xl font-bold text-forest-800 mb-2">
                          {successStories[activeStory].title}
                        </h3>
                        <p className="text-lg text-forest-600 mb-4">{successStories[activeStory].village}</p>
                        <blockquote className="text-gray-700 italic mb-6">
                          "{successStories[activeStory].quote}"
                        </blockquote>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/50 rounded-lg p-3">
                            <p className="text-2xl font-bold text-forest-700">{successStories[activeStory].beneficiaries}</p>
                            <p className="text-sm text-gray-600">Beneficiaries</p>
                          </div>
                          <div className="bg-white/50 rounded-lg p-3">
                            <p className="text-2xl font-bold text-earth-700">{successStories[activeStory].area}</p>
                            <p className="text-sm text-gray-600">Forest Area</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-200 h-64 md:h-auto flex items-center justify-center">
                      <Trees className="w-32 h-32 text-gray-400" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Carousel Controls */}
              <div className="flex justify-center gap-2 mt-6">
                {successStories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStory(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeStory ? 'bg-forest-600 w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
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
    </div>
  )
}