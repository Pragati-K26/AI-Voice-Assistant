'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api'

export default function ConnectBankButton() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleConnectBank = async () => {
    setLoading(true)
    setMessage(null)

    try {
      // Get link token from backend
      const response = await apiClient.post(
        '/api/plaid/link-token',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.error) {
        setMessage('Plaid is not configured. Using mock data instead.')
        return
      }

      const { link_token } = response.data

      // For now, show a message. In production, you would use Plaid Link SDK here
      setMessage('Plaid Link would open here. For now, use "Load Mock Data" to test with sample transactions.')
      
      // TODO: Integrate Plaid Link SDK
      // import { usePlaidLink } from 'react-plaid-link'
      // const { open, ready } = usePlaidLink({
      //   token: link_token,
      //   onSuccess: (public_token, metadata) => {
      //     exchangeToken(public_token)
      //   },
      // })
      // open()
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Failed to connect bank. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1">
      <button
        onClick={handleConnectBank}
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Connecting...' : 'Connect Bank Account'}
      </button>
      {message && (
        <p className="mt-2 text-sm text-slate-600">{message}</p>
      )}
    </div>
  )
}


