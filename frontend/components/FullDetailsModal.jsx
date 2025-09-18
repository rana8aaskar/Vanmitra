import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, User, MapPin, FileText, CreditCard, Calendar,
  Building2, Droplets, UserCheck, Globe, Download,
  Printer, Share2, CheckCircle, Clock, XCircle, Loader2, TrendingUp
} from 'lucide-react'
import DSSRecommendations from './DSSRecommendations'
import api from '../services/api'

export default function FullDetailsModal({ isOpen, onClose, claimData }) {
  const [loading, setLoading] = useState(false)
  const [dssRecommendations, setDssRecommendations] = useState(null)
  const [loadingDSS, setLoadingDSS] = useState(false)

  useEffect(() => {
    if (claimData && isOpen) {
      fetchDSSRecommendations()
    }
  }, [claimData, isOpen])

  const fetchDSSRecommendations = async () => {
    if (!claimData || !claimData.id) return

    setLoadingDSS(true)
    try {
      // Try ML prediction first
      const mlResponse = await api.get(`/dss/ml-predictions/${claimData.id}`)

      if (mlResponse.data && mlResponse.data.recommendedSchemes) {
        console.log('ML predictions received:', mlResponse.data)
        setDssRecommendations(mlResponse.data)
      } else {
        // Fallback to regular DSS recommendations
        const response = await api.get('/dss/recommendations', {
          params: {
            claim_id: claimData.id,
            state: claimData.state,
            district: claimData.district,
            village: claimData.village
          }
        })

        if (response.data && response.data.length > 0) {
          // Transform the old format to new format if needed
          const recommendations = response.data[0]
          const transformedData = {
            recommendedSchemes: recommendations.recommended_schemes || [],
            overallScore: recommendations.overall_priority,
            totalSchemes: recommendations.recommended_schemes?.length || 0,
            topPriority: recommendations.top_scheme,
            village: claimData.village
          }
          setDssRecommendations(transformedData)
        }
      }
    } catch (error) {
      console.error('Error fetching DSS recommendations:', error)
      // Don't show error to user, just silently fail
    } finally {
      setLoadingDSS(false)
    }
  }

  if (!claimData) return null

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase()
    switch(statusLower) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    const statusLower = (status || '').toLowerCase()
    switch(statusLower) {
      case 'approved': return <CheckCircle className="w-5 h-5" />
      case 'pending': return <Clock className="w-5 h-5" />
      case 'rejected': return <XCircle className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-forest-600 to-forest-700 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Claim Details</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-lg">ID: #{claimData.id || 'N/A'}</span>
                    <span className={`px-3 py-1 rounded-full font-medium flex items-center gap-2 ${
                      (claimData.status_of_claim || '').toLowerCase() === 'approved' ? 'bg-green-500/80' :
                      (claimData.status_of_claim || '').toLowerCase() === 'pending' ? 'bg-yellow-500/80' :
                      'bg-red-500/80'
                    }`}>
                      {getStatusIcon(claimData.status_of_claim)}
                      {claimData.status_of_claim || 'Unknown'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }} id="claim-details-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Personal Information Section */}
                <div className="bg-gradient-to-br from-forest-50 to-forest-100/50 rounded-xl p-5 border border-forest-200">
                  <h3 className="text-lg font-semibold text-forest-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-forest-600" />
                    Personal Information
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Claimant Name</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.claimant_name || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Spouse Name</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.spouse_name || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Age</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.age || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Gender</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.gender || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Category</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.category || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-sm text-gray-600">Aadhaar Number</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.aadhaar_no || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Location Information Section */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Location Information
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">State</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.state || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">District</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.district || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Tehsil/Block</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.tehsil || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Village</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.village || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Gram Panchayat</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.gram_panchayat || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-sm text-gray-600">Coordinates</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.geo_coordinates || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Claim Information Section */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Claim Information
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Claim Type</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.claim_type || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Land Use</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.land_use || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Area Claimed</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.land_claimed || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Annual Income</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.annual_income || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Tax Payer</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.tax_payer || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-sm text-gray-600">Patta Title No</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.patta_title_no || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Status & Dates Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-xl p-5 border border-indigo-200">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Status & Timeline
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Current Status</dt>
                      <dd className={`text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2 ${getStatusColor(claimData.status_of_claim)}`}>
                        {getStatusIcon(claimData.status_of_claim)}
                        {claimData.status_of_claim || 'Unknown'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Submission Date</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatDate(claimData.date_of_submission)}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Decision Date</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatDate(claimData.date_of_decision)}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Created At</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatDate(claimData.created_at)}</dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-sm text-gray-600">Last Updated</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatDate(claimData.updated_at)}</dd>
                    </div>
                  </dl>
                </div>

                {/* Infrastructure Section */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-5 border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-orange-600" />
                    Infrastructure & Resources
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Water Body</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.water_body || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Irrigation Source</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.irrigation_source || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-sm text-gray-600">Infrastructure</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.infrastructure_present || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Verification Section */}
                <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl p-5 border border-teal-200">
                  <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-teal-600" />
                    Verification & Authorities
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Gram Sabha Verified</dt>
                      <dd className={`text-sm font-medium ${
                        claimData.verified_by_gram_sabha === 'Yes' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {claimData.verified_by_gram_sabha || 'N/A'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Gram Sabha Chair</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.gram_sabha_chairperson || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <dt className="text-sm text-gray-600">Forest Officer</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.forest_dept_officer || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between py-2">
                      <dt className="text-sm text-gray-600">Revenue Officer</dt>
                      <dd className="text-sm font-medium text-gray-900">{claimData.revenue_dept_officer || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Boundary Description - Full Width */}
                {claimData.boundary_description && (
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-xl p-5 md:col-span-2 border border-cyan-200">
                    <h3 className="text-lg font-semibold text-cyan-800 mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-cyan-600" />
                      Boundary Description
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {claimData.boundary_description}
                    </p>
                  </div>
                )}

                {/* DSS Recommendations Section - Full Width */}
                <div className="md:col-span-2">
                  {loadingDSS ? (
                    <div className="bg-gradient-to-br from-forest-50 to-forest-100/50 rounded-xl p-8 border border-forest-200">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-8 h-8 text-forest-600 animate-spin" />
                        <div className="text-center">
                          <p className="text-lg font-medium text-forest-800">Analyzing Claim Data</p>
                          <p className="text-sm text-forest-600 mt-1">Please wait while we process scheme recommendations...</p>
                        </div>
                      </div>
                    </div>
                  ) : dssRecommendations ? (
                    <div className="bg-gradient-to-br from-forest-50 to-forest-100/50 rounded-xl p-5 border border-forest-200">
                      <h3 className="text-lg font-semibold text-forest-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-forest-600" />
                        DSS Engine - Scheme Recommendations
                      </h3>
                      <DSSRecommendations
                        claimId={claimData.id}
                        claimData={claimData}
                        dssRecommendations={dssRecommendations}
                      />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">DSS recommendations not available</p>
                        <button
                          onClick={fetchDSSRecommendations}
                          className="mt-2 text-sm text-forest-600 hover:text-forest-700 font-medium"
                        >
                          Retry Analysis
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-forest-200 p-4 bg-gradient-to-r from-forest-50 to-forest-100">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm text-forest-700 bg-white border border-forest-300 rounded-lg hover:bg-forest-50 transition-colors flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button className="px-4 py-2 text-sm text-forest-700 bg-white border border-forest-300 rounded-lg hover:bg-forest-50 transition-colors flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm text-white bg-gradient-to-r from-forest-600 to-forest-700 rounded-lg hover:from-forest-700 hover:to-forest-800 transition-all shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}