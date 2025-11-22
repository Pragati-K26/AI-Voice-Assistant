'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api'

interface OnboardingFlowProps {
  onComplete: () => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user, token } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [transactionsLoaded, setTransactionsLoaded] = useState(false)

  // Check if user already has transactions
  useEffect(() => {
    if (token) {
      checkTransactions()
    }
  }, [token])

  const checkTransactions = async () => {
    if (!token) return
    
    try {
      const response = await apiClient.get('/api/banking/spending/summary', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const summary = response.data
      if (summary.total_spending > 0 || summary.total_income > 0) {
        setTransactionsLoaded(true)
        // Auto-complete if transactions exist
        setTimeout(() => {
          onComplete()
        }, 1000)
      }
    } catch (error) {
      // No transactions yet
    }
  }

  const handleConnectBank = async () => {
    if (!token) return
    
    setLoading(true)
    setMessage(null)

    try {
      // Try to get link token
      const response = await apiClient.post(
        '/api/plaid/link-token',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.error) {
        // Plaid not configured, use mock data instead
        await handleLoadMockData()
        return
      }

      setMessage('Plaid Link would open here. Loading mock data for now...')
      // For now, load mock data. In production, open Plaid Link
      await handleLoadMockData()
    } catch (error: any) {
      // If Plaid fails, use mock data
      await handleLoadMockData()
    }
  }

  const handleLoadMockData = async () => {
    if (!token) return
    
    setLoading(true)
    setMessage('Loading sample transactions...')

    try {
      const response = await apiClient.post(
        '/api/banking/transactions/seed-mock',
        { count: 30 },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage(`✅ ${response.data.message}`)
      setTransactionsLoaded(true)
      
      // Wait a moment then complete onboarding
      setTimeout(() => {
        onComplete()
      }, 2000)
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to load transactions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (transactionsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Setup Complete!</h2>
          <p className="text-slate-600 mb-6">Your transactions are ready. You can now use the voice assistant!</p>
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
        {/* Progress Indicator */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className="w-4"></div>
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          </div>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="px-8 pb-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome to VoiceBank!</h2>
            <p className="text-lg text-slate-600 mb-6">
              Your AI-powered voice assistant for banking operations. Let's connect your bank account to get started.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-slate-900 mb-2">What you can do:</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Check balances and transactions
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Transfer funds and make payments
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Get spending insights and summaries
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All through natural voice commands
                </li>
              </ul>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>
        )}

        {/* Step 2: Connect Bank */}
        {step === 2 && (
          <div className="px-8 pb-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Bank Account</h2>
              <p className="text-slate-600">
                Securely connect your bank to sync transactions and enable voice banking features.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Bank-level Security</p>
                    <p className="text-sm text-slate-600">256-bit encryption</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Automatic Sync</p>
                    <p className="text-sm text-slate-600">Real-time transaction updates</p>
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-lg mb-4 ${
                message.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className="text-sm text-slate-700">{message}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleConnectBank}
                disabled={loading}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting...
                  </span>
                ) : (
                  'Connect Bank Account'
                )}
              </button>
              
              <button
                onClick={handleLoadMockData}
                disabled={loading}
                className="w-full px-6 py-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Use Sample Data (Demo)'}
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-4">
              By continuing, you agree to securely connect your bank account using Plaid.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

