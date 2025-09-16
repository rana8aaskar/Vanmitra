import Head from 'next/head'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Cookies from 'js-cookie'
import api from '../services/api'

export default function FraActPage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      api.setAuthToken(token)
      api.getMe().then((u) => setUser(u.user)).catch(() => {})
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Forest Rights Act (FRA) - Vanmitra</title>
      </Head>

      <Navbar user={user} setUser={setUser} />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Forest Rights Act (FRA), 2006</h1>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            The FRA recognizes the rights of forest-dwelling Scheduled Tribes and other traditional forest dwellers to land and other forest resources, which they have been dependent on for generations.
          </p>

          <div className="space-y-8">
            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Key Provisions</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Recognition of individual and community rights over forest land</li>
                <li>Rights to minor forest produce, grazing, and cultural practices</li>
                <li>Community forest resource rights for protection and management</li>
                <li>Transparent processes through Gram Sabha-led verification</li>
              </ul>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Process Overview</h2>
              <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                <li>Claim submission to the Gram Sabha</li>
                <li>Field verification and mapping</li>
                <li>Recommendations by Sub-Divisional and District Level Committees</li>
                <li>Title issuance and record updates</li>
              </ol>
            </section>

            <section className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Resources</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <a href="#" className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50">FRA Act PDF</a>
                <a href="#" className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50">Operational Guidelines</a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}


