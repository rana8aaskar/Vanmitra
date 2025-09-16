import { motion, AnimatePresence } from 'framer-motion'
import {
  X, User, MapPin, FileText, CreditCard, Calendar,
  Building2, Droplets, UserCheck, Globe, Download,
  Printer, Share2, CheckCircle, Clock, XCircle
} from 'lucide-react'

export default function FullDetailsModal({ isOpen, onClose, claimData }) {
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
            <div className="bg-gradient-to-r from-forest-600 to-water-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Claim Details</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span>ID: #{claimData.id || 'N/A'}</span>
                    <span className={`px-3 py-1 rounded-full font-medium ${
                      (claimData.status_of_claim || '').toLowerCase() === 'approved' ? 'bg-green-500' :
                      (claimData.status_of_claim || '').toLowerCase() === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}>
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
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-water-600" />
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
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                <div className="bg-gray-50 rounded-lg p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
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
                  <div className="bg-gray-50 rounded-lg p-5 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-cyan-600" />
                      Boundary Description
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {claimData.boundary_description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm text-white bg-gradient-to-r from-forest-600 to-water-600 rounded-lg hover:from-forest-700 hover:to-water-700 transition-all"
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