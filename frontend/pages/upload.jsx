import { useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import FileUpload from '../components/FileUpload'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, CheckCircle, FileText, Trees, Droplets, ArrowRight,
  CloudUpload, Shield, Zap, FileCheck, Calendar, User,
  MapPin, Award, Clock, AlertCircle, Sparkles
} from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Cookies from 'js-cookie'

export default function UploadPage() {
  const [user, setUser] = useState(null)
  const [uploadedDoc, setUploadedDoc] = useState(null)
  const [loading, setLoading] = useState(false)
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

  const handleUpload = async (file) => {
    setLoading(true)
    try {
      const result = await api.uploadDoc(file)
      setUploadedDoc(result.document)
      toast.success('Document uploaded and processed successfully!')

      if (!result.processing.success) {
        toast.warning('Document saved but processing failed. You can reprocess later.')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
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

  const steps = [
    {
      number: '01',
      title: 'Upload Document',
      description: 'Select and upload your FRA document',
      icon: CloudUpload,
      gradient: 'from-forest-400 to-forest-600'
    },
    {
      number: '02',
      title: 'AI Processing',
      description: 'Smart extraction of key information',
      icon: Zap,
      gradient: 'from-water-400 to-water-600'
    },
    {
      number: '03',
      title: 'Review & Manage',
      description: 'Access processed data instantly',
      icon: FileCheck,
      gradient: 'from-emerald-400 to-emerald-600'
    }
  ]

  const features = [
    { icon: Shield, text: 'Secure Upload', color: 'text-forest-600' },
    { icon: Zap, text: 'Fast Processing', color: 'text-water-600' },
    { icon: Award, text: 'High Accuracy', color: 'text-emerald-600' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Head>
        <title>Upload Document - Vanmitra</title>
        <meta name="description" content="Upload forest and water resource documents" />
      </Head>

      <Navbar user={user} setUser={setUser} />

      <main className="pt-24 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-forest-100 to-water-100 rounded-full text-sm font-medium text-gray-700 mb-4">
              <Sparkles className="w-4 h-4 text-forest-600" />
              AI-Powered Processing
            </div>
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-forest-600 to-water-600 bg-clip-text text-transparent">
                Upload Your Document
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Transform your FRA documents into actionable insights with our advanced AI processing
            </p>

            {/* Feature Pills */}
            <div className="flex justify-center gap-4 mt-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm"
                >
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mb-12"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-forest-100/30 to-water-100/30 rounded-3xl blur-xl" />
            <div className="relative bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-forest-500 to-forest-600 rounded-lg">
                  <CloudUpload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Select Your Document</h2>
                  <p className="text-sm text-gray-600">Supported formats: PDF, JPG, PNG</p>
                </div>
              </div>
              <FileUpload onUpload={handleUpload} loading={loading} />
            </div>
          </motion.div>

          {/* Enhanced Results Section */}
          <AnimatePresence>
            {uploadedDoc && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative mb-12"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-forest-100/30 rounded-3xl blur-xl" />
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-forest-400 to-forest-600 rounded-full animate-pulse" />
                        <div className="relative w-12 h-12 bg-gradient-to-br from-forest-500 to-forest-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">Successfully Processed</h2>
                        <p className="text-sm text-gray-500">Document ID: #{uploadedDoc.id || 'DOC001'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      Just now
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-forest-600" />
                          <label className="text-sm font-medium text-gray-600">Claimant Name</label>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{uploadedDoc.claimant_name || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-water-50 to-water-100/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-water-600" />
                          <label className="text-sm font-medium text-gray-600">District</label>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{uploadedDoc.district || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-forest-50 to-forest-100/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-forest-600" />
                          <label className="text-sm font-medium text-gray-600">State</label>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{uploadedDoc.state || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-4 h-4 text-gray-600" />
                          <label className="text-sm font-medium text-gray-600">Claim Status</label>
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full ${
                            uploadedDoc.claim_status === 'approved'
                              ? 'bg-gradient-to-r from-forest-100 to-emerald-100 text-forest-700'
                              : uploadedDoc.claim_status === 'rejected'
                              ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700'
                              : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700'
                          }`}>
                            {uploadedDoc.claim_status === 'approved' && <CheckCircle className="w-3 h-3" />}
                            {uploadedDoc.claim_status === 'rejected' && <XCircle className="w-3 h-3" />}
                            {uploadedDoc.claim_status === 'pending' && <Clock className="w-3 h-3" />}
                            {uploadedDoc.claim_status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.a
                      href="/dashboard"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-water-600 to-water-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                    >
                      View Dashboard
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setUploadedDoc(null)
                        const fileInput = document.querySelector('input[type="file"]')
                        if (fileInput) fileInput.value = ''
                      }}
                      className="flex-1 px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Upload Another Document
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced How it Works */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-forest-600 to-water-600 bg-clip-text text-transparent mb-3">
                Simple 3-Step Process
              </h3>
              <p className="text-gray-600">Get your documents processed in minutes, not hours</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100/50 to-gray-200/50 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-5xl font-bold bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent opacity-20">
                        {step.number}
                      </span>
                      <div className={`p-3 bg-gradient-to-br ${step.gradient} rounded-xl shadow-lg`}>
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
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
                  <Upload className="w-6 h-6 text-water-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">Access Upload</h2>
                <p className="text-sm text-gray-500 mt-1">Sign in to upload documents</p>
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