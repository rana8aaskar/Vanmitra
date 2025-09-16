import Head from 'next/head'
import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Cookies from 'js-cookie'
import api from '../services/api'

export default function ImpactPage() {
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
        <title>Impact - Vanmitra</title>
      </Head>
      <Navbar user={user} setUser={setUser} />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8">Impact & Coverage</h1>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'FRA Claims Digitized', value: '40,00,000+' },
              { label: 'Villages Covered', value: '1,20,000+' },
              { label: 'Community Rights Granted', value: '2,500+' },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <div className="text-3xl font-extrabold text-emerald-700">{s.value}</div>
                <div className="text-gray-700 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Coverage Map</h2>
            <iframe src="/map-wrapper.html" className="w-full h-[480px] border-0 rounded-xl" title="Coverage Map" />
          </div>
        </div>
      </main>
    </div>
  )
}


