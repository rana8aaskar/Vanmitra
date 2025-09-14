import { useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import FileUpload from '../components/FileUpload'
import { toast } from 'react-toastify'
import api from '../services/api'
import Cookies from 'js-cookie'

export default function Home() {
  const [user, setUser] = useState(null)
  const [uploadedDoc, setUploadedDoc] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is logged in
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

  const handleUpload = async (file) => {
    setLoading(true)
    try {
      const result = await api.uploadDoc(file)
      setUploadedDoc(result.document)
      toast.success('Document uploaded and processed successfully!')

      // Show processing status
      if (!result.processing.success) {
        toast.warning('Document saved but processing failed. You can reprocess later.')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>FRA Claims Management System</title>
        <meta name="description" content="Upload and manage FRA claim documents" />
      </Head>

      <Navbar user={user} setUser={setUser} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            FRA Claims Document Upload
          </h1>

          <div className="bg-white rounded-lg shadow-md p-8">
            <FileUpload onUpload={handleUpload} loading={loading} />
          </div>

          {uploadedDoc && (
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Processed Document</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Claimant Name:</label>
                  <p>{uploadedDoc.claimant_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-semibold">District:</label>
                  <p>{uploadedDoc.district || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-semibold">State:</label>
                  <p>{uploadedDoc.state || 'N/A'}</p>
                </div>
                <div>
                  <label className="font-semibold">Status:</label>
                  <p className="capitalize">{uploadedDoc.claim_status || 'N/A'}</p>
                </div>
              </div>
              <div className="mt-4">
                <a
                  href="/dashboard"
                  className="text-blue-600 hover:underline"
                >
                  View all documents →
                </a>
              </div>
            </div>
          )}

          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-2">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Upload your FRA claim form (PDF, JPG, or PNG format)</li>
              <li>Our AI model will extract details automatically</li>
              <li>Review and edit the extracted information</li>
              <li>Track your claim status in the dashboard</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}