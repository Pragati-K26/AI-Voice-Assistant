'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import MicIcon from './icons/MicIcon'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export default function BankingServices() {
  const { token } = useAuth()
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [response, setResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)

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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Banking Services</h2>
            <p className="text-blue-100">Access all your banking needs with voice commands</p>
          </div>
          <div className="bg-white/20 rounded-full p-4">
            <MicIcon />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer border-2 border-transparent hover:border-blue-200"
            onClick={() => handleQuickAction(service.action)}
          >
            <div className="text-4xl mb-4">{service.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <div className="flex items-center text-blue-600 font-medium">
              <span>Try it now</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {activeFeature && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Response</h3>
            <button
              onClick={() => {
                setActiveFeature(null)
                setResponse('')
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <p className="text-gray-700">{response || 'Processing...'}</p>
          )}
        </div>
      )}
    </div>
  )
}

