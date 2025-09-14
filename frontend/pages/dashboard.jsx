import { useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import DocumentCard from '../components/DocumentCard'
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

  useEffect(() => {
    // Check if user is logged in
    const token = Cookies.get('token')
    if (token) {
      api.setAuthToken(token)
      fetchUser()
    }
    fetchDocuments()
    fetchStatistics()
  }, [])

  const fetchUser = async () => {
    try {
      const userData = await api.getMe()
      setUser(userData.user)
    } catch (error) {
      console.error('Failed to fetch user:', error)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard - FRA Claims</title>
        <meta name="description" content="View and manage FRA claim documents" />
      </Head>

      <Navbar user={user} setUser={setUser} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">FRA Claims Dashboard</h1>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Documents</div>
              <div className="text-2xl font-bold">{statistics.total_documents}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Approved</div>
              <div className="text-2xl font-bold text-green-600">{statistics.approved}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Rejected</div>
              <div className="text-2xl font-bold text-red-600">{statistics.rejected}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">States</div>
              <div className="text-2xl font-bold">{statistics.states_covered}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Districts</div>
              <div className="text-2xl font-bold">{statistics.districts_covered}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              name="state"
              placeholder="State"
              value={filters.state}
              onChange={handleFilterChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="district"
              placeholder="District"
              value={filters.district}
              onChange={handleFilterChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="claim_status"
              value={filters.claim_status}
              onChange={handleFilterChange}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processing_error">Processing Error</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">FRA Documents</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No documents found</p>
              <a href="/" className="text-blue-600 hover:underline mt-2 inline-block">
                Upload your first document →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onUpdate={handleDocumentUpdate}
                  canEdit={user && (user.role === 'admin' || user.id === doc.uploaded_by)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}