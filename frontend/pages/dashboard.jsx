import { useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import DocumentCard from '../components/DocumentCard'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, CheckCircle, Clock, XCircle, MapPin, Building2,
  Filter, Upload, Search, Trees, Droplets, TrendingUp,
  Activity, BarChart3, Users, Calendar, Download,
  RefreshCw, Grid, List, SortDesc
} from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Cookies from 'js-cookie'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    state: '',
    district: '',
    claim_status: ''
  })
  const [statistics, setStatistics] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
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
      fetchDocuments()
      fetchStatistics()
    } else {
      setShowLoginModal(true)
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const userData = await api.getMe()
      setUser(userData.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setShowLoginModal(true)
    }
  }

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const docs = await api.fetchDocs(filters)
      setDocuments(docs.documents)
    } catch (error) {
      toast.error('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const stats = await api.getStatistics()
      setStatistics(stats.statistics)
    } catch (error) {
      console.error('Failed to fetch statistics')
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchDocuments()
  }

  const handleDocumentUpdate = async (id, data) => {
    try {
      await api.updateDocument(id, data)
      toast.success('Document updated successfully')
      fetchDocuments()
    } catch (error) {
      toast.error('Failed to update document')
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
      fetchDocuments()
      fetchStatistics()
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
      fetchDocuments()
      fetchStatistics()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
    }
  }

  const statCards = [
    {
      label: 'Total Documents',
      value: statistics?.total_documents || 0,
      icon: FileText,
      gradient: 'from-gray-500 to-gray-600',
      bgGradient: 'from-gray-50 to-gray-100',
      trend: '+12%',
      trendUp: true
    },
    {
      label: 'Approved',
      value: statistics?.approved || 0,
      icon: CheckCircle,
      gradient: 'from-forest-500 to-forest-600',
      bgGradient: 'from-forest-50 to-forest-100',
      trend: '+8%',
      trendUp: true
    },
    {
      label: 'Pending Review',
      value: statistics?.pending || 0,
      icon: Clock,
      gradient: 'from-yellow-500 to-amber-600',
      bgGradient: 'from-yellow-50 to-amber-100',
      trend: '-3%',
      trendUp: false
    },
    {
      label: 'Rejected',
      value: statistics?.rejected || 0,
      icon: XCircle,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      trend: '-15%',
      trendUp: false
    },
    {
      label: 'States Covered',
      value: statistics?.states_covered || 0,
      icon: MapPin,
      gradient: 'from-water-500 to-water-600',
      bgGradient: 'from-water-50 to-water-100',
      trend: '+2',
      trendUp: true
    },
    {
      label: 'Districts',
      value: statistics?.districts_covered || 0,
      icon: Building2,
      gradient: 'from-forest-500 to-emerald-600',
      bgGradient: 'from-forest-50 to-emerald-100',
      trend: '+5',
      trendUp: true
    }
  ]

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Head>
        <title>Dashboard - Vanmitra</title>
        <meta name="description" content="Manage your forest and water resources" />
      </Head>

      <Navbar user={user} setUser={setUser} />

      <main className="pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header with Actions */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-forest-600 to-water-600 bg-clip-text text-transparent">
                  Resource Dashboard
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchDocuments}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </motion.button>
                <motion.a
                  href="/upload"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-gradient-to-r from-forest-600 to-forest-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload New
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Statistics Cards with Glass Morphism */}
          {statistics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {statCards.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="relative overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50 rounded-2xl`} />
                  <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 bg-gradient-to-br ${stat.gradient} rounded-lg`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className={`flex items-center gap-1 text-xs ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp className={`w-3 h-3 ${!stat.trendUp && 'rotate-180'}`} />
                        {stat.trend}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold bg-gradient-to-br from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {stat.value.toLocaleString()}
                      </p>
                      <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-water-50 to-forest-50 rounded-2xl p-6 mb-8 border border-white/50 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-water-500 to-water-600 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-forest-600">24</p>
                  <p className="text-xs text-gray-600">New Claims</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-water-600">18</p>
                  <p className="text-xs text-gray-600">Processed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">6</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
              </div>
              <div className="hidden md:block">
                <BarChart3 className="w-32 h-16 text-gray-300" />
              </div>
            </div>
          </motion.div>

          {/* Enhanced Filters with Glass Morphism */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-forest-100/30 to-water-100/30 rounded-2xl blur-xl" />
            <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Smart Filters</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-br from-forest-500 to-forest-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-br from-forest-500 to-forest-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleFilterSubmit} className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="Enter state"
                      value={filters.state}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">District</label>
                    <input
                      type="text"
                      name="district"
                      placeholder="Enter district"
                      value={filters.district}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-water-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select
                      name="claim_status"
                      value={filters.claim_status}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="processing_error">Processing Error</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-forest-600 to-forest-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Apply
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setFilters({ state: '', district: '', claim_status: '' })
                        setSearchQuery('')
                      }}
                      className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Enhanced Documents Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-forest-50/30 to-water-50/30 rounded-2xl blur-xl" />
            <div className="relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-lg overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-white/90 to-gray-50/90 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-forest-500 to-forest-600 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Resource Documents</h2>
                      <p className="text-xs text-gray-500">{documents.length} total documents</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-white/50 rounded-lg hover:bg-white/80 transition-all">
                      <SortDesc className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-2 bg-white/50 rounded-lg hover:bg-white/80 transition-all">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-16 text-center"
                  >
                    <div className="relative">
                      <div className="animate-spin w-12 h-12 border-3 border-forest-600 border-t-transparent rounded-full mx-auto"></div>
                      <div className="animate-spin w-12 h-12 border-3 border-water-600 border-t-transparent rounded-full mx-auto absolute inset-0 animate-reverse-spin"></div>
                    </div>
                    <p className="text-gray-600 mt-4">Loading documents...</p>
                  </motion.div>
                ) : documents.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-16 text-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h3>
                    <p className="text-gray-600 mb-6">Start by uploading your first resource document</p>
                    <motion.a
                      href="/upload"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-forest-600 to-forest-700 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      Upload First Document
                    </motion.a>
                  </motion.div>
                ) : (
                  <motion.div
                    key="documents"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-6 ${
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'space-y-3'
                    }`}
                  >
                    {documents.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <DocumentCard
                          document={doc}
                          onUpdate={handleDocumentUpdate}
                          canEdit={user && (user.role === 'admin' || user.id === doc.uploaded_by)}
                          viewMode={viewMode}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Login Modal - Minimal */}
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

      {/* Register Modal - Minimal */}
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
    </div>
  )
}