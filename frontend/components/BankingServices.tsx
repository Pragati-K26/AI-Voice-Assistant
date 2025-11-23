'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import MicIcon from './icons/MicIcon'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-voice-assistant-evgf.onrender.com'

interface BankingServicesProps {
  initialService?: string | null
}

export default function BankingServices({ initialService }: BankingServicesProps) {
  const { token } = useAuth()
  const [activeFeature, setActiveFeature] = useState<string | null>(initialService || null)
  const [response, setResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialService) {
      setActiveFeature(initialService)
    }
  }, [initialService])

  const handleQuickAction = async (text: string) => {
    setLoading(true)
    setActiveFeature(text)
    setResponse('')

    try {
      const result = await axios.post(
        `${API_URL}/api/voice/process`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setResponse(result.data.response_text)
    } catch (error) {
      setResponse('Error processing request')
    } finally {
      setLoading(false)
    }
  }

  const services = [
    {
      id: 'balance',
      title: 'Check Balance',
      description: 'View your account balance',
      icon: '💰',
      action: 'Check my balance',
    },
    {
      id: 'transactions',
      title: 'View Transactions',
      description: 'See recent transaction history',
      icon: '📜',
      action: 'Show my transactions',
    },
    {
      id: 'transfer',
      title: 'Transfer Funds',
      description: 'Send money to others',
      icon: '💸',
      action: 'Transfer money',
    },
    {
      id: 'loans',
      title: 'Loan Information',
      description: 'Check loan details and EMIs',
      icon: '🏦',
      action: 'Loan information',
    },
    {
      id: 'rates',
      title: 'Interest Rates',
      description: 'View current interest rates',
      icon: '📊',
      action: 'Interest rates',
    },
    {
      id: 'credit',
      title: 'Credit Limit',
      description: 'Check your credit card limit',
      icon: '💳',
      action: 'Credit limit',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-8 relative overflow-hidden animate-fadeInUp">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-float"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 gradient-text">Banking Services</h2>
              <p className="text-white/70">Access all your banking needs with voice commands</p>
            </div>
            <div className="glass rounded-full p-4">
              <MicIcon />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div
            key={service.id}
            className="glass-hover rounded-xl p-6 cursor-pointer relative overflow-hidden group animate-fadeInUp"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleQuickAction(service.action)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
              <p className="text-white/70 mb-4">{service.description}</p>
              <div className="flex items-center text-blue-300 group-hover:text-blue-200 font-medium transition-colors">
                <span>Try it now</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeFeature && (
        <div className="glass rounded-xl p-6 animate-fadeInScale">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Response</h3>
            <button
              onClick={() => {
                setActiveFeature(null)
                setResponse('')
              }}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="relative">
                <div className="w-8 h-8 border-[3px] border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-8 h-8 border-[3px] border-purple-400/20 border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
            </div>
          ) : (
            <p className="text-white/90">{response || 'Processing...'}</p>
          )}
        </div>
      )}
    </div>
  )
}

