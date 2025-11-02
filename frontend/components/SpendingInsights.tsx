'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import ChartIcon from './icons/ChartIcon'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export default function SpendingInsights() {
  const { token } = useAuth()
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  useEffect(() => {
    fetchSpendingData()
  }, [selectedPeriod])

  const fetchSpendingData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/banking/spending/summary?period=${selectedPeriod}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSummary(response.data)
    } catch (error) {
      console.error('Error fetching spending data:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = summary?.category_breakdown || {}

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
    ]
    return colors[index % colors.length]
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      food: '🍔',
      transport: '🚗',
      shopping: '🛍️',
      bills: '💡',
      entertainment: '🎬',
      healthcare: '🏥',
      education: '📚',
      transfer: '💸',
      other: '📦',
    }
    return icons[category] || '📦'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading spending data...</div>
      </div>
    )
  }

  const totalSpending = summary?.total_spending || 0
  const maxCategoryAmount = Math.max(...Object.values(categories).map(v => v as number), 1)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Spending Insights</h2>
            <p className="text-purple-100">Track and analyze your expenses</p>
          </div>
          <div className="bg-white/20 rounded-full p-4">
            <ChartIcon />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm text-purple-100 mb-1">Total Spending</p>
            <p className="text-2xl font-bold">₹{totalSpending.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm text-purple-100 mb-1">Income</p>
            <p className="text-2xl font-bold">₹{summary?.total_income?.toLocaleString('en-IN') || '0'}</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-sm text-purple-100 mb-1">Savings</p>
            <p className="text-2xl font-bold">₹{summary?.savings?.toLocaleString('en-IN') || '0'}</p>
          </div>
        </div>

        <div className="mt-6 flex space-x-2">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {Object.keys(categories).length > 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Category Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(categories).map(([category, amount], index) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                    <span className="font-medium text-gray-900 capitalize">{category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">₹{(amount as number).toLocaleString('en-IN')}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({((amount as number) / totalSpending * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${getCategoryColor(index)} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${((amount as number) / maxCategoryAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Top Category */}
          {summary?.top_category && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-1">Top Spending Category</p>
              <p className="text-lg font-bold text-gray-900 capitalize flex items-center">
                {getCategoryIcon(summary.top_category)}
                <span className="ml-2">{summary.top_category}</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Spending Data</h3>
          <p className="text-gray-600">Start making transactions to see your spending insights</p>
        </div>
      )}
    </div>
  )
}

