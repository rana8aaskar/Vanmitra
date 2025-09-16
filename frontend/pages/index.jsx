import { useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import { motion } from 'framer-motion'
import {
  Trees, Droplets, Cloud, Shield, BarChart3, ArrowRight, Leaf,
  Sparkles, CheckCircle, Users, Globe, Award, TrendingUp, Zap,
  Mountain, Waves, Wind, LayoutDashboard, FileText
} from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Cookies from 'js-cookie'

export default function Home() {
  const [user, setUser] = useState(null)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
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

  const features = [
    {
      icon: Cloud,
      title: 'Smart Upload',
      description: 'AI-powered document processing with instant analysis',
      color: 'from-water-400 to-water-600',
      bg: 'bg-water-50',
      image: '🌊'
    },
    {
      icon: Shield,
      title: 'Forest Protection',
      description: 'Advanced monitoring and conservation strategies',
      color: 'from-forest-400 to-forest-600',
      bg: 'bg-forest-50',
      image: '🌲'
    },
    {
      icon: BarChart3,
      title: 'Resource Analytics',
      description: 'Real-time insights and predictive analysis',
      color: 'from-purple-400 to-purple-600',
      bg: 'bg-purple-50',
      image: '📊'
    }
  ]

  const stats = [
    { value: '40,00,000+', label: 'FRA claims digitized', icon: TrendingUp },
    { value: '1,20,000+', label: 'Villages covered', icon: Mountain },
    { value: '2,500+', label: 'Community rights granted', icon: Award },
    { value: '85%', label: 'Satellite-mapped land verified', icon: Zap }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      <Head>
        <title>Vanmitra - Forest & Water Resource Management</title>
        <meta name="description" content="Protect forests and water resources with AI-powered automation" />
      </Head>

      <Navbar user={user} setUser={setUser} />

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-forest-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-water-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-forest-100/10 via-transparent to-water-100/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section - MoTA Official */}
      <section className="relative pt-32 pb-16 px-4 bg-gradient-to-b from-emerald-50 via-white to-white" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23059669\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl"
            >
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
                Empowering Tribal Communities
                <br />
                through the Forest Rights Act
          </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                Digitizing FRA records, mapping forest assets, and enabling data-driven development for India's forests and forest dwellers.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!user ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const registerBtn = document.querySelector('[data-register-trigger]')
                        if (registerBtn) registerBtn.click()
                      }}
                      className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 border border-emerald-700"
                    >
                      <Sparkles className="w-5 h-5" />
                      Explore FRA Atlas
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 bg-white text-emerald-700 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all border-2 border-emerald-600 hover:bg-emerald-50"
                    >
                      Submit FRA Claim
                    </motion.button>
                  </>
                ) : (
                  <motion.a
                    href="/dashboard"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group px-8 py-4 bg-gradient-to-r from-forest-600 to-water-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.a>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Atlas Mini-Map Preview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-gray-900">FRA Atlas Preview</h2>
            <a href="/dashboard" className="text-emerald-700 font-semibold">Open Full Map →</a>
          </div>
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <iframe src="/map-wrapper.html" className="w-full h-[420px] border-0" title="FRA Atlas Preview" />
          </div>
        </div>
      </section>

      {/* About MoTA Block */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-3xl shadow-sm p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center bg-white">
              <img src="/emblems/ashoka.svg" alt="Emblem of India" className="w-16 h-16 object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Ministry of Tribal Affairs</h3>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 mb-4">Government of India</span>
              <p className="text-gray-700 leading-relaxed">
                The Ministry of Tribal Affairs (MoTA) is committed to the socio-economic empowerment of India's tribal communities. Through initiatives like FRA digitization, MoTA ensures transparency, justice, and access to resources for millions of forest dwellers across the nation.
              </p>
            </div>
            <div className="flex gap-3">
              <a href="#fra-act" className="px-5 py-3 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold">Learn More About MoTA</a>
              <a href="/impact" className="px-5 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-lg">View Our Initiatives</a>
            </div>
          </div>
        </div>
      </section>

      {/* What is FRA Act? */}
      <section id="fra-act" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-emerald-700 mb-4">What is the Forest Rights Act?</h2>
            <p className="text-lg text-gray-600">Understanding India's landmark legislation for forest-dwelling communities</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-gray-700 leading-relaxed mb-8">
                The Forest Rights Act (FRA), 2006 recognizes the rights of forest-dwelling communities to land, resources, and sustainable livelihoods. It empowers tribal groups to legally access forest produce, farming land, and protect biodiversity.
              </p>
              
              {/* Key Rights List */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                <div>
                    <h3 className="font-bold text-emerald-700 mb-1">Community Rights</h3>
                    <p className="text-gray-600 text-sm">Recognition of traditional forest dwellers and their ancestral land rights</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trees className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h3 className="font-bold text-emerald-700 mb-1">Forest Produce Access</h3>
                    <p className="text-gray-600 text-sm">Legal rights to collect, use, and dispose of minor forest produce</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h3 className="font-bold text-emerald-700 mb-1">Land Titles</h3>
                    <p className="text-gray-600 text-sm">Individual and community forest rights with proper documentation</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <img src="/images/fra-infographic.svg" alt="FRA Infographic" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced Cards */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-forest-600 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Powerful Tools for Conservation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to monitor, analyze, and protect our natural resources
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onHoverStart={() => setActiveFeature(index)}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-forest-200/50 to-water-200/50 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-100">
                  <div className="absolute top-8 right-8 text-4xl opacity-10">{feature.image}</div>

                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  <button className="text-forest-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Active Indicator */}
                  {activeFeature === index && (
                    <motion.div
                      layoutId="activeFeature"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-forest-500 to-water-500 rounded-b-3xl"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI + Tech Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-10">AI + Technology</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { title: 'Digitization', desc: 'Extracting text from scanned FRA records', emoji: '📜' },
              { title: 'Satellite AI Mapping', desc: 'Detecting land, water and forest assets', emoji: '🛰' },
              { title: 'WebGIS Portal', desc: 'Explore FRA claims in real-time', emoji: '🌐' },
              { title: 'DSS Engine', desc: 'AI schemes recommendations (PM-KISAN, JJM)', emoji: '🧠' },
            ].map((c) => (
              <div key={c.title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{c.emoji}</div>
                <div className="font-semibold text-gray-900 mb-1">{c.title}</div>
                <div className="text-gray-600 text-sm">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats - Dynamic counters */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 bg-gradient-to-br from-forest-100 to-water-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                >
                  <stat.icon className="w-8 h-8 text-forest-600" />
                </motion.div>
                <div className="text-4xl font-bold bg-gradient-to-r from-forest-600 to-water-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Forest Background */}
      <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-br from-emerald-800 via-green-700 to-emerald-900">
        {/* Forest Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-emerald-600/10 to-emerald-800/20"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-600/10 rounded-full blur-xl"></div>
          <div className="absolute top-20 right-20 w-40 h-40 bg-green-600/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-emerald-700/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-green-700/10 rounded-full blur-xl"></div>
        </div>
        
        {/* Tree Silhouettes */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-emerald-900 to-transparent"></div>
          <div className="absolute bottom-0 left-10 w-8 h-24 bg-emerald-900 transform rotate-12"></div>
          <div className="absolute bottom-0 left-20 w-6 h-20 bg-emerald-900 transform -rotate-6"></div>
          <div className="absolute bottom-0 left-32 w-10 h-28 bg-emerald-900 transform rotate-8"></div>
          <div className="absolute bottom-0 left-48 w-7 h-22 bg-emerald-900 transform -rotate-12"></div>
          <div className="absolute bottom-0 left-64 w-9 h-26 bg-emerald-900 transform rotate-6"></div>
          <div className="absolute bottom-0 left-80 w-8 h-24 bg-emerald-900 transform -rotate-8"></div>
          <div className="absolute bottom-0 left-96 w-6 h-20 bg-emerald-900 transform rotate-10"></div>
        </div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/60 via-emerald-800/50 to-emerald-900/60"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join the Movement for a Greener Future
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Be part of the solution. Start protecting our forests and water resources today with AI-powered technology.
          </p>

          {!user && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const registerBtn = document.querySelector('[data-register-trigger]')
                if (registerBtn) registerBtn.click()
              }}
              className="px-10 py-5 bg-white text-emerald-700 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all border-2 border-emerald-600"
            >
              Get Started Now - It's Free
            </motion.button>
          )}

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5" />
              <span>10,000+ Active Users</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Award className="w-5 h-5" />
              <span>Award Winning Platform</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Globe className="w-5 h-5" />
              <span>50+ Countries</span>
            </div>
          </div>
        </motion.div>
      </section>


      {/* Get Involved */}
      <section className="py-16 px-4 bg-emerald-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Get Involved</h2>
            <p className="text-gray-700 mb-6">We invite NGOs, State Departments, and Communities to partner with MoTA in accelerating FRA implementation and transparency.</p>
          </div>
          <div className="flex gap-3 justify-end">
            <a href="/upload" className="px-5 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-lg">Upload Legacy Data</a>
            <a href="/contact" className="px-5 py-3 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold">Partner with MoTA</a>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="py-12 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-forest-600 to-water-600 p-2 rounded-xl">
                <div className="flex items-center">
                  <Trees className="w-5 h-5 text-white" />
                  <Droplets className="w-4 h-4 text-white -ml-1" />
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-900">Vanmitra</p>
                <p className="text-xs text-gray-500">Protecting Nature, Preserving Future</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-forest-600 transition-colors">About</a>
              <a href="#" className="hover:text-forest-600 transition-colors">Features</a>
              <a href="#" className="hover:text-forest-600 transition-colors">Contact</a>
              <a href="#" className="hover:text-forest-600 transition-colors">Privacy</a>
            </div>

            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-500">© 2024 Vanmitra. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}