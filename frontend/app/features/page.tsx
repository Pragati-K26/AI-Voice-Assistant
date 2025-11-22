'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

function FeaturesContent() {
  const { isAuthenticated, user } = useAuth()
  const mainFeatures = [
    {
      title: 'Voice Banking',
      description: 'Control your finances with natural voice commands. Check balances, transfer funds, pay bills, and more—all hands-free.',
      icon: '🎤',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      details: [
        'Natural language processing',
        'Multi-language support',
        'Voice authentication',
        'Hands-free operation',
      ],
    },
    {
      title: 'Advanced Security',
      description: 'Bank-grade encryption and multi-factor authentication protect your financial data at every step.',
      icon: '🔒',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop',
      details: [
        '256-bit encryption',
        'Biometric authentication',
        'Real-time fraud detection',
        'Secure transaction monitoring',
      ],
    },
    {
      title: 'Smart Analytics',
      description: 'Get personalized insights into your spending patterns and receive intelligent financial recommendations.',
      icon: '📊',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      details: [
        'Spending categorization',
        'Budget tracking',
        'Financial goal setting',
        'Predictive analytics',
      ],
    },
    {
      title: 'Instant Transactions',
      description: 'Execute banking operations in seconds with our streamlined, intuitive interface designed for speed.',
      icon: '⚡',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
      details: [
        'Real-time processing',
        'Instant notifications',
        'Transaction history',
        'Quick actions',
      ],
    },
  ]

  const additionalFeatures = [
    {
      title: 'Multi-Device Sync',
      description: 'Access your account seamlessly across desktop, tablet, and mobile devices with real-time synchronization.',
      icon: '📱',
    },
    {
      title: 'Bill Management',
      description: 'Set up automatic bill payments and never miss a due date with our intelligent reminder system.',
      icon: '💳',
    },
    {
      title: 'Investment Tracking',
      description: 'Monitor your investment portfolio and track performance with comprehensive analytics and reporting.',
      icon: '📈',
    },
    {
      title: 'Loan Management',
      description: 'Apply for loans, track payments, and manage your credit with our integrated loan management system.',
      icon: '🏦',
    },
    {
      title: '24/7 Support',
      description: 'Get help whenever you need it with our round-the-clock customer support team.',
      icon: '💬',
    },
    {
      title: 'API Access',
      description: 'Integrate VoiceBank with your existing systems using our comprehensive REST API.',
      icon: '🔌',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation isAuthenticated={isAuthenticated} user={user} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-serif font-bold text-slate-900 mb-6">
              Powerful Features for Modern Banking
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Everything you need to manage your finances efficiently, securely, and intuitively.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 items-center mb-20 ${
                index % 2 === 1 ? 'lg:grid-flow-dense' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="rounded-2xl shadow-xl w-full"
                />
              </div>
              <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">
                  {feature.title}
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-slate-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">
              More Features
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Additional tools and capabilities to enhance your banking experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-serif font-bold text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Start your free trial today and see how VoiceBank can transform your banking experience.
          </p>
          <a
            href="/login"
            className="inline-block px-10 py-5 bg-white text-slate-900 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-slate-50 transform hover:-translate-y-1"
          >
            Get Started Free
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function FeaturesPage() {
  return (
    <AuthProvider>
      <FeaturesContent />
    </AuthProvider>
  )
}

