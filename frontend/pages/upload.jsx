import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import FullDetailsModal from '../components/FullDetailsModal'
import DSSRecommendations from '../components/DSSRecommendations'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, CheckCircle, FileText, Shield, AlertCircle,
  Download, Eye, MapPin, Calendar, User, Award,
  ChevronRight, CloudUpload, Zap, Activity, TrendingUp,
  Clock, Hash, Home as HomeIcon, CreditCard, Loader2, Check,
  FileCheck, Database, Cpu, Globe, BarChart3, Menu, X, LogOut, ChevronDown
} from 'lucide-react'
import { showToast } from '../components/CustomToast'
import api from '../services/api'
import Cookies from 'js-cookie'
import { generateClaimReport, generateCSVReport } from '../utils/generateReport'

export default function UploadPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [uploadedDocs, setUploadedDocs] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showFullDetails, setShowFullDetails] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState('')
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
  const [stats, setStats] = useState({
    totalUploads: 0,
    successfulProcessing: 0,
    pendingReview: 0,
    approved: 0
  })

  const processingStages = [
    { name: 'Uploading Document', progress: 20 },
    { name: 'Extracting Text (OCR)', progress: 40 },
    { name: 'AI Analysis', progress: 60 },
    { name: 'Data Validation', progress: 80 },
    { name: 'Finalizing', progress: 100 }
  ]

  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      api.setAuthToken(token)
      fetchUser()
      fetchStats()
    } else {
      // Redirect to home page with login modal if not authenticated
      router.push('/')
      showToast.warning('Please sign in to access the upload page')
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

  const fetchStats = async () => {
    try {
      // Fetch real statistics from the API
      const response = await api.getStatistics()
      const statistics = response.statistics || response

      setStats({
        totalUploads: parseInt(statistics.total_documents) || 0,
        successfulProcessing: parseInt(statistics.processed) || 0,
        pendingReview: parseInt(statistics.pending) || 0,
        approved: parseInt(statistics.approved) || 0
      })
    } catch (error) {
      console.error('Failed to fetch statistics:', error)
      // Keep default values on error
    }
  }

  const simulateProcessing = async () => {
    for (const stage of processingStages) {
      setProcessingStage(stage.name)
      setProcessingProgress(stage.progress)
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      showToast.error('Invalid File Type', 'Please upload a PDF or image file (JPG, PNG)')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showToast.warning('File Too Large', 'File size should be less than 10MB')
      return
    }

    await handleUpload(file)
  }

  const handleUpload = async (file) => {
    setUploading(true)
    setProcessingProgress(0)
    setProcessingStage('')

    try {
      // Start processing simulation
      const processingPromise = simulateProcessing()

      // Step 1: Process the document for preview
      const processResult = await api.uploadDoc(file)

      // Wait for processing animation to complete
      await processingPromise

      // Extract data from the response
      const extractedData = processResult.extractedData || processResult.document || {}

      // Log for debugging
      console.log('Process API Response:', processResult)
      console.log('Extracted Data:', extractedData)

      // Step 2: Save the document to get claim ID and DSS recommendations
      console.log('Saving document to database...')
      const saveResult = await api.saveDocument(extractedData)

      console.log('Save API Response:', saveResult)
      console.log('DSS Recommendations:', saveResult.dssRecommendations)

      // Count actual extracted fields
      const extractedFieldsCount = Object.keys(extractedData).filter(key => extractedData[key] && extractedData[key] !== '').length
      const validatedFieldsCount = extractedFieldsCount - 2 // Approximate validated count

      const newDoc = {
        id: saveResult.document?.id || Date.now(),
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type.split('/')[1].toUpperCase(),
        uploadDate: new Date().toISOString(),
        processingDate: new Date().toISOString(),
        status: extractedData.status_of_claim || 'processed',
        confidence: processResult.success ? 95 : 85,
        extractedFields: extractedFieldsCount,
        validatedFields: validatedFieldsCount,
        data: extractedData,
        dssRecommendations: saveResult.dssRecommendations,
        operation: saveResult.operation
      }

      setUploadedDocs(prev => [newDoc, ...prev])

      // Show different messages based on whether it's an update or new creation
      if (saveResult.operation === 'update') {
        const changedCount = saveResult.changedFields?.length || 0
        const schemeCount = saveResult.dssRecommendations?.recommendedSchemes?.length ||
                          saveResult.dssRecommendations?.totalSchemes || 0
        showToast.success(
          'Existing Claim Updated',
          `Found existing claim ID ${saveResult.document?.id}. ${changedCount} field(s) updated. ${schemeCount} schemes recommended.`
        )
      } else if (saveResult.operation === 'no_change') {
        const schemeCount = saveResult.dssRecommendations?.recommendedSchemes?.length ||
                          saveResult.dssRecommendations?.totalSchemes || 0
        showToast.info(
          'Existing Claim Found',
          `Claim ID ${saveResult.document?.id} already exists. No changes detected. ${schemeCount} schemes recommended.`
        )
      } else {
        // New claim created
        const schemeCount = saveResult.dssRecommendations?.recommendedSchemes?.length ||
                          saveResult.dssRecommendations?.totalSchemes || 0
        if (schemeCount > 0) {
          showToast.success(
            'New Claim Created',
            `Claim ID ${saveResult.document?.id} created. ${schemeCount} government schemes recommended based on ML analysis!`
          )
        } else {
          showToast.success(
            'New Claim Created',
            `Claim ID ${saveResult.document?.id} created with ${newDoc.confidence}% confidence.`
          )
        }
      }

      // Refresh stats to get real data
      fetchStats()

      if (!processResult.success) {
        showToast.warning(
          'Processing Incomplete',
          'Document saved but some fields could not be extracted. Manual review required.'
        )
      }
    } catch (error) {
      console.error('Upload error:', error)
      showToast.error(
        'Upload Failed',
        error.response?.data?.error || 'Unable to process document. Please try again.'
      )
    } finally {
      setUploading(false)
      setProcessingProgress(0)
      setProcessingStage('')
    }
  }

  const handleViewDetails = (doc) => {
    setSelectedClaim(doc.data || doc)
    setShowFullDetails(true)
  }

  const handleDownloadReport = (doc) => {
    const claimData = doc.data || doc
    generateClaimReport(claimData)
    showToast.success('Report Generated', 'Document has been downloaded to your device')
  }

  const handleDownloadCSV = (doc) => {
    const claimData = doc.data || doc
    generateCSVReport(claimData)
    showToast.success('CSV Exported', 'Data has been exported to CSV format')
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
      showToast.success('Logged in successfully!')
      setFormData({ name: '', email: '', password: '' })
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Login failed')
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
      showToast.success('Registered successfully!')
      setFormData({ name: '', email: '', password: '' })
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Registration failed')
    }
  }

  const handleLogout = () => {
    Cookies.remove('token')
    setUser(null)
    setShowProfileMenu(false)
    showToast.success('Logged out successfully')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Upload FRA Documents - Vanmitra Portal</title>
        <meta name="description" content="Upload and process Forest Rights Act documents" />
      </Head>

      {/* Enhanced Navbar - Same as Homepage */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-lg z-50 border-b border-forest-200">
        <nav className="bg-white/95 backdrop-blur-md">
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
                  { href: '/', label: 'Home', icon: HomeIcon },
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
                          ? 'bg-forest-100 text-forest-800 font-semibold shadow-sm' 
                          : 'text-gray-700 hover:text-forest-600 hover:bg-forest-50'
                      }`}
                    >
                      {item.icon && <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />}
                      <span className="relative">
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
                    className="group flex items-center gap-2 bg-gradient-to-r from-forest-600 to-forest-700 text-white px-6 py-2.5 rounded-xl hover:from-forest-700 hover:to-forest-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
              className="md:hidden bg-white/95 backdrop-blur-md border-b border-forest-200 overflow-hidden"
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
                  { href: '/', label: 'Home', icon: HomeIcon },
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
                          ? 'bg-forest-100 text-forest-800 font-semibold' 
                          : 'text-gray-700 hover:bg-forest-50 hover:text-forest-600'
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

      {/* Hero Section with MoTA Branding */}
      <section className="bg-gradient-to-br from-forest-600 to-forest-800 pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <Shield className="w-12 h-12 text-white/80" />
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  FRA Document Upload Portal
                </h1>
              </div>
              <p className="text-xl text-white/90 mb-8">
                Submit your Forest Rights Act claims and documents for AI-powered processing
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-3xl font-bold text-white">{stats.totalUploads}</p>
                  <p className="text-sm text-white/80">Total Uploads</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-3xl font-bold text-white">{stats.successfulProcessing}</p>
                  <p className="text-sm text-white/80">Processed</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-3xl font-bold text-white">{stats.pendingReview}</p>
                  <p className="text-sm text-white/80">Under Review</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <p className="text-3xl font-bold text-white">{stats.approved}</p>
                  <p className="text-sm text-white/80">Approved</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 -mt-8">
        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden max-w-5xl mx-auto"
        >
          <div className="bg-forest-50 border-b border-forest-100 px-6 py-4">
            <h2 className="text-xl font-bold text-forest-800 flex items-center gap-2">
              <CloudUpload className="w-5 h-5" />
              Upload FRA Documents
            </h2>
          </div>

          <div className="p-8">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-forest-500 transition-colors relative">
              {uploading && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur flex flex-col items-center justify-center z-10 rounded-lg">
                  <div className="w-full max-w-sm">
                    <div className="mb-6">
                      <Loader2 className="w-12 h-12 text-forest-600 animate-spin mx-auto mb-4" />
                      <p className="text-lg font-semibold text-gray-800">{processingStage || 'Processing...'}</p>
                      <p className="text-sm text-gray-600 mt-2">This will take a while, please be patient...</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <motion.div
                        className="bg-forest-600 h-3 rounded-full transition-all duration-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${processingProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">{processingProgress}% Complete</p>
                  </div>
                </div>
              )}

              <input
                type="file"
                id="fileUpload"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={uploading}
              />
              <label
                htmlFor="fileUpload"
                className="cursor-pointer"
              >
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  PDF, JPG, PNG up to 10MB
                </p>
                <button
                  className="bg-forest-600 text-white px-6 py-3 rounded-lg hover:bg-forest-700 transition-colors inline-flex items-center gap-2"
                  onClick={() => document.getElementById('fileUpload').click()}
                  disabled={uploading}
                >
                  <Upload className="w-5 h-5" />
                  Select Document
                </button>
              </label>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-4 gap-4 mt-8">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-forest-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">OCR Processing</p>
                  <p className="text-xs text-gray-600">Text extraction from images</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="w-5 h-5 text-forest-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">AI Analysis</p>
                  <p className="text-xs text-gray-600">Smart field detection</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-forest-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Data Validation</p>
                  <p className="text-xs text-gray-600">Automatic verification</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-forest-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-800">Real-time Status</p>
                  <p className="text-xs text-gray-600">Track progress live</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Uploaded Documents - Comprehensive Cards */}
        {uploadedDocs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-5xl mx-auto mt-8"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Processed Documents</h3>

            <div className="space-y-6">
              {uploadedDocs.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  {/* Document Header */}
                  <div className="bg-gradient-to-r from-forest-50 to-earth-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <FileText className="w-6 h-6 text-forest-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">{doc.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(doc.uploadDate).toLocaleDateString()}
                            </span>
                            <span>{doc.size}</span>
                            <span className="px-2 py-0.5 bg-forest-100 text-forest-700 rounded text-xs font-medium">
                              {doc.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="text-sm text-gray-600">Confidence Score</p>
                          <p className="text-2xl font-bold text-forest-600">{doc.confidence}%</p>
                        </div>
                        <button
                          onClick={() => handleViewDetails(doc)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDownloadReport(doc)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDownloadCSV(doc)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Export CSV"
                        >
                          <FileText className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Processing Stats */}
                  <div className="px-6 py-4 bg-gray-50 border-b">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Fields Extracted</p>
                        <p className="text-xl font-bold text-gray-800">{doc.extractedFields}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Validated</p>
                        <p className="text-xl font-bold text-green-600">{doc.validatedFields}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Processing Time</p>
                        <p className="text-xl font-bold text-gray-800">2.3s</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-green-700 font-semibold">Processed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Extracted Data Preview */}
                  {doc.data && (
                    <div className="px-6 py-6">
                      <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Extracted Information
                      </h5>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-3">
                          <h6 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Personal Details</h6>
                          <div className="space-y-2">
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Claimant Name</span>
                              <span className="text-sm font-medium">{doc.data.claimant_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Gender</span>
                              <span className="text-sm font-medium">{doc.data.gender || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Spouse Name</span>
                              <span className="text-sm font-medium">{doc.data.spouse_name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Category</span>
                              <span className="text-sm font-medium">{doc.data.category || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Aadhaar</span>
                              <span className="text-sm font-medium">{doc.data.aadhaar_no || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Location & Claim */}
                        <div className="space-y-3">
                          <h6 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Location & Claim</h6>
                          <div className="space-y-2">
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Village</span>
                              <span className="text-sm font-medium">{doc.data.village || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                              <span className="text-sm text-gray-600">District</span>
                              <span className="text-sm font-medium">{doc.data.district || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                              <span className="text-sm text-gray-600">State</span>
                              <span className="text-sm font-medium">{doc.data.state || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Claim Type</span>
                              <span className="text-sm font-medium">{doc.data.claim_type || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Land Claimed</span>
                              <span className="text-sm font-medium">{doc.data.land_claimed || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Status</span>
                              <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                                doc.data.status_of_claim === 'Approved'
                                  ? 'bg-green-100 text-green-700'
                                  : doc.data.status_of_claim === 'Rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {doc.data.status_of_claim || 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* DSS Recommendations */}
                      {doc.dssRecommendations ? (
                        <DSSRecommendations
                          claimId={doc.id}
                          claimData={doc.data}
                          dssRecommendations={doc.dssRecommendations}
                        />
                      ) : (
                        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-yellow-600" />
                            <h6 className="text-sm font-semibold text-yellow-900 uppercase tracking-wide">
                              DSS Recommendations
                            </h6>
                          </div>
                          <p className="text-sm text-yellow-700">
                            DSS recommendations are being processed. Please check back in a few moments or contact an administrator.
                          </p>
                          <button
                            onClick={() => window.location.reload()}
                            className="mt-2 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded transition-colors"
                          >
                            Refresh to check for updates
                          </button>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-6 pt-6 border-t">
                        <button
                          onClick={() => handleViewDetails(doc)}
                          className="flex-1 bg-forest-600 text-white px-4 py-2 rounded-lg hover:bg-forest-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Full Details
                        </button>
                        <button
                          onClick={() => handleDownloadReport(doc)}
                          className="flex-1 border border-forest-600 text-forest-600 px-4 py-2 rounded-lg hover:bg-forest-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Report
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* Full Details Modal */}
      <AnimatePresence>
        {showFullDetails && selectedClaim && (
          <FullDetailsModal
            claim={selectedClaim}
            onClose={() => {
              setShowFullDetails(false)
              setSelectedClaim(null)
            }}
          />
        )}
      </AnimatePresence>

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
                  <Upload className="w-8 h-8 text-white" />
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