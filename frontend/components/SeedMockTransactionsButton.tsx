'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api'

export default function SeedMockTransactionsButton() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSeedMock = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await apiClient.post(
        '/api/banking/transactions/seed-mock',
        { count: 20 },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage(`✅ ${response.data.message}. Refresh the page to see your transactions.`)
      
      // Refresh after 2 seconds
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to load mock transactions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1">
      <button
        onClick={handleSeedMock}
        disabled={loading}
        className="w-full px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : 'Load Mock Data'}
      </button>
      {message && (
        <p className="mt-2 text-sm text-slate-600">{message}</p>
      )}
    </div>
  )
}



