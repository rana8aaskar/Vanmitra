import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import FullDetailsModal from '../components/FullDetailsModal'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Filter, ChevronRight, ChevronLeft, Trees, Droplets,
  Mountain, Building, Layers, Info, ZoomIn, ZoomOut,
  Navigation, Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  User, FileText, Activity, Hash, Home, CreditCard, Users,
  Globe, Gavel, UserCheck, Building2, IndianRupee, Download
} from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Cookies from 'js-cookie'
import { generateClaimReport, generateCSVReport } from '../utils/generateReport'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loadingClaim, setLoadingClaim] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [showFullDetails, setShowFullDetails] = useState(false)
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

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      api.setAuthToken(token)
      fetchUser()
    } else {
      setShowLoginModal(true)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Set up message listener for map interactions
    const handleMessage = async (event) => {
      if (event.data.type === 'markerClick') {
        const clickedData = event.data.data
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
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trees className="w-6 h-6 text-forest-600 animate-pulse" />
            <Droplets className="w-6 h-6 text-water-600 animate-pulse" />
          </div>
          <p className="text-gray-600">Loading...</p>
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

      <Navbar user={user} setUser={setUser} />

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
              className="absolute right-0 top-0 bottom-0 w-[480px] z-30 p-4"
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
                      className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-white" />
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