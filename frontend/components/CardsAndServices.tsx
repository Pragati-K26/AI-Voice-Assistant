'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import CardIcon from './icons/CardIcon'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export default function CardsAndServices() {
  const { token } = useAuth()
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/banking/cards`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCards(response.data.cards || [])
    } catch (error) {
      console.error('Error fetching cards:', error)
    }
  }

  const handleCardAction = async (cardId: string, action: string) => {
    setLoading(true)
    try {
      await axios.post(
        `${API_URL}/api/banking/cards/action`,
        { card_id: cardId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchCards() // Refresh
    } catch (error) {
      console.error('Error performing card action:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestChequebook = async () => {
    setLoading(true)
    try {
      await axios.post(
        `${API_URL}/api/banking/chequebook/request`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Cheque book request submitted successfully!')
    } catch (error) {
      console.error('Error requesting cheque book:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Cards & Services</h2>
            <p className="text-indigo-100">Manage your cards and request services</p>
          </div>
          <div className="bg-white/20 rounded-full p-4">
            <CardIcon />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div
              key={card.card_id}
              className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-indigo-200 text-sm mb-1">{card.card_type.toUpperCase()} CARD</p>
                  <p className="text-xl font-bold">•••• •••• •••• {card.last_four}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-200 text-xs mb-1">Status</p>
                  <p className="font-medium">
                    {card.status === 'active' ? '✓ Active' : '✗ Inactive'}
                  </p>
                </div>
                {card.spending_limit && (
                  <div className="text-right">
                    <p className="text-indigo-200 text-xs mb-1">Limit</p>
                    <p className="font-medium">₹{card.spending_limit.toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex space-x-2">
                  {card.status === 'active' ? (
                    <button
                      onClick={() => handleCardAction(card.card_id, 'block')}
                      className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 font-medium transition-colors"
                    >
                      Block Card
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCardAction(card.card_id, 'unblock')}
                      className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 font-medium transition-colors"
                    >
                      Unblock Card
                    </button>
                  )}
                  <button
                    onClick={() => {/* Show set limit modal */}}
                    className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 px-4 font-medium transition-colors"
                  >
                    Set Limit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Services</h3>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-4">
            <button
              onClick={requestChequebook}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-3xl">📄</div>
                <div className="text-left">
                  <p className="font-bold text-gray-900 group-hover:text-blue-600">Request Cheque Book</p>
                  <p className="text-sm text-gray-600">Get a new cheque book delivered to your address</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🏦</div>
                <div className="text-left">
                  <p className="font-bold text-gray-900 group-hover:text-green-600">Branch Locator</p>
                  <p className="text-sm text-gray-600">Find nearest bank branch or ATM</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-3xl">💼</div>
                <div className="text-left">
                  <p className="font-bold text-gray-900 group-hover:text-purple-600">Investment Services</p>
                  <p className="text-sm text-gray-600">Explore investment options and mutual funds</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

