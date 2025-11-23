'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navigation from './Navigation'
import Footer from './Footer'
import { useAuth } from '@/contexts/AuthContext'

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  const features = [
    {
      icon: '🎤',
      title: 'Voice Banking',
      description: 'Manage your finances with natural voice commands. Check balances, transfer funds, and more—all hands-free.',
    },
    {
      icon: '🔒',
      title: 'Bank-Grade Security',
      description: 'Your financial data is protected with enterprise-level encryption and multi-factor authentication.',
    },
    {
      icon: '📊',
      title: 'Smart Insights',
      description: 'Get personalized spending insights and financial recommendations powered by advanced analytics.',
    },
    {
      icon: '⚡',
      title: 'Instant Transactions',
      description: 'Execute banking operations in seconds with our streamlined, intuitive interface.',
    },
    {
      icon: '📱',
      title: 'Multi-Device Access',
      description: 'Access your account seamlessly across desktop, tablet, and mobile devices.',
    },
    {
      icon: '💬',
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist you whenever you need help.',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Financial Advisor',
      company: 'Wealth Management Inc.',
      content: 'This platform has transformed how I manage my clients\' accounts. The voice interface is intuitive and secure.',
      avatar: 'https://i.pravatar.cc/150?img=47',
    },
    {
      name: 'Michael Rodriguez',
      role: 'Small Business Owner',
      company: 'Rodriguez & Associates',
      content: 'As someone always on the go, being able to handle banking with voice commands has been a game-changer.',
      avatar: 'https://i.pravatar.cc/150?img=12',
    },
    {
      name: 'Emily Watson',
      role: 'Tech Professional',
      company: 'Innovation Labs',
      content: 'The security features give me confidence, and the user experience is exceptional. Highly recommended.',
      avatar: 'https://i.pravatar.cc/150?img=45',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation isAuthenticated={isAuthenticated} user={user} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-serif font-bold text-slate-900 leading-tight">
                  Banking Made Simple, Secure, and Smart
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed max-w-2xl">
                  Experience the future of financial management with our voice-powered banking platform.
                  Secure, intuitive, and designed for the modern professional.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/login')}
                  className="px-8 py-4 bg-slate-900 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-slate-800 transform hover:-translate-y-0.5"
                >
                  Get Started
                </button>
                <button
                  onClick={() => router.push('/features')}
                  className="px-8 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:border-slate-400 transform hover:-translate-y-0.5"
                >
                  Learn More
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-slate-900">10K+</div>
                  <div className="text-sm text-slate-600">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">99.9%</div>
                  <div className="text-sm text-slate-600">Uptime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">256-bit</div>
                  <div className="text-sm text-slate-600">Encryption</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
                  alt="Professional team working"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Transaction Complete</div>
                    <div className="text-sm text-slate-600">₹5,000 transferred</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed to simplify your financial management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">
              Our Story
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              This project is developed as part of GHCI Hackathon.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">
              Meet the Team
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The minds behind VoiceBank
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Nilam Bhojwani', role: 'AI/ML Developer' },
              { name: 'Kanak Meshram', role: 'Frontend Developer' },
              { name: 'Pragati Kesharwani', role: 'Database Analytics and Manager' },
              { name: 'Adhishree Shilledar', role: 'Lead Researcher and Marketing Team' },
            ].map((member, index) => (
              <div
                key={index}
                className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-slate-600 text-sm">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-bold text-white mb-6">
            Ready to Transform Your Banking Experience?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust our platform for their financial needs.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-10 py-5 bg-white text-slate-900 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-slate-50 transform hover:-translate-y-1"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

