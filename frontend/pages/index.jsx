import { useState, useEffect } from 'react'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import { motion } from 'framer-motion'
import {
  Trees, Droplets, Cloud, Shield, BarChart3, ArrowRight, Leaf,
  Sparkles, CheckCircle, Users, Globe, Award, TrendingUp, Zap,
  Mountain, Waves, Wind, LayoutDashboard
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
    { value: '10K+', label: 'Documents Processed', icon: TrendingUp },
    { value: '500+', label: 'Protected Areas', icon: Mountain },
    { value: '99.9%', label: 'Accuracy Rate', icon: Award },
    { value: '24/7', label: 'Monitoring', icon: Zap }
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

      {/* Hero Section - Enhanced */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Animated Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-forest-100 to-water-100 text-forest-700 text-sm font-medium rounded-full mb-8 shadow-lg"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI-Powered Environmental Protection</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-forest-600 via-green-600 to-water-600 bg-clip-text text-transparent">
                  Protecting
                </span>
                <br />
                <span className="text-gray-900">Our Planet's</span>
                <br />
                <span className="bg-gradient-to-r from-water-600 to-forest-600 bg-clip-text text-transparent">
                  Resources
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Advanced AI technology meets environmental conservation.
                Monitor, analyze, and protect forests and water resources with unprecedented accuracy.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!user ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const registerBtn = document.querySelector('[data-register-trigger]')
                        if (registerBtn) registerBtn.click()
                      }}
                      className="group px-8 py-4 bg-gradient-to-r from-forest-600 to-water-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                    >
                      <Sparkles className="w-5 h-5" />
                      Start Free Trial
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all border border-gray-200"
                    >
                      Watch Demo
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

              {/* Trust Indicators */}
              <div className="flex items-center gap-8 mt-12">
                <div className="flex -space-x-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 bg-gradient-to-br from-forest-400 to-water-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trusted by</p>
                  <p className="font-semibold text-gray-900">10,000+ Organizations</p>
                </div>
              </div>
            </motion.div>

            {/* Interactive Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-forest-50 via-white to-water-50 rounded-3xl p-8 shadow-2xl border border-gray-100">
                {/* Animated Elements */}
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-water-400 to-water-600 rounded-2xl opacity-20 blur-xl"
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Mini Cards */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-forest-100"
                  >
                    <Trees className="w-8 h-8 text-forest-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1">Forest Health</h4>
                    <p className="text-sm text-gray-600">Real-time monitoring</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-2xl shadow-lg border border-water-100"
                  >
                    <Droplets className="w-8 h-8 text-water-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-1">Water Quality</h4>
                    <p className="text-sm text-gray-600">AI analysis</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-blue-600 font-medium">Monitoring</span>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-forest-100 to-forest-200 p-6 rounded-2xl col-span-2"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Protection Status</h4>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Coverage Area</span>
                        <span className="text-sm font-semibold">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '85%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="bg-gradient-to-r from-forest-500 to-water-500 h-2 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Floating Icons */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2"
                >
                  <div className="bg-white p-3 rounded-full shadow-lg">
                    <Globe className="w-6 h-6 text-forest-600" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
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

      {/* Stats Section - Modern Design */}
      <section className="py-20 px-4 bg-gradient-to-br from-forest-50 via-white to-water-50">
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

      {/* CTA Section - Enhanced */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-600 via-green-600 to-water-600"></div>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10">
            <Trees className="w-40 h-40 text-white" />
          </div>
          <div className="absolute bottom-10 right-10">
            <Droplets className="w-40 h-40 text-white" />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

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
              className="px-10 py-5 bg-white text-forest-700 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all"
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