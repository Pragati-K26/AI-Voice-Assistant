'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import ChartIcon from './icons/ChartIcon'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-voice-assistant-evgf.onrender.com'

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
        <div className="glass rounded-2xl p-8 animate-fadeInScale">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-8 h-8 border-[3px] border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-8 h-8 border-[3px] border-pink-400/20 border-t-pink-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <div className="text-white font-medium text-lg animate-pulse">Loading spending data...</div>
          </div>
        </div>
      </div>
    )
  }

  const totalSpending = summary?.total_spending || 0
  const maxCategoryAmount = Math.max(...Object.values(categories).map(v => v as number), 1)

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-8 relative overflow-hidden animate-fadeInUp">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-float"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2 gradient-text">Spending Insights</h2>
              <p className="text-white/70">Track and analyze your expenses</p>
            </div>
            <div className="glass rounded-full p-4">
              <ChartIcon />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 animate-fadeInUp stagger-1">
              <p className="text-sm text-white/70 mb-1">Total Spending</p>
              <p className="text-2xl font-bold text-white gradient-text">₹{totalSpending.toLocaleString('en-IN')}</p>
            </div>
            <div className="glass rounded-xl p-4 animate-fadeInUp stagger-2">
              <p className="text-sm text-white/70 mb-1">Income</p>
              <p className="text-2xl font-bold text-white gradient-text">₹{summary?.total_income?.toLocaleString('en-IN') || '0'}</p>
            </div>
            <div className="glass rounded-xl p-4 animate-fadeInUp stagger-3">
              <p className="text-sm text-white/70 mb-1">Savings</p>
              <p className="text-2xl font-bold text-white gradient-text">₹{summary?.savings?.toLocaleString('en-IN') || '0'}</p>
            </div>
          </div>

          <div className="mt-6 flex space-x-2">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  selectedPeriod === period
                    ? 'glass bg-white/20 text-white border-white/30'
                    : 'glass text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {Object.keys(categories).length > 0 ? (
        <div className="glass rounded-xl p-6 animate-fadeInUp stagger-4">
          <h3 className="text-xl font-bold text-white mb-6">Category Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(categories).map(([category, amount], index) => (
              <div key={category} className="animate-slideInRight" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                    <span className="font-medium text-white capitalize">{category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white">₹{(amount as number).toLocaleString('en-IN')}</span>
                    <span className="text-sm text-white/60 ml-2">
                      ({((amount as number) / totalSpending * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full glass bg-white/10 rounded-full h-3 overflow-hidden">
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
            <div className="mt-6 p-4 glass rounded-lg border-l-4 border-purple-400 animate-fadeInScale">
              <p className="text-sm text-white/70 mb-1">Top Spending Category</p>
              <p className="text-lg font-bold text-white capitalize flex items-center">
                {getCategoryIcon(summary.top_category)}
                <span className="ml-2">{summary.top_category}</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center animate-fadeInScale">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-white mb-2">No Spending Data</h3>
          <p className="text-white/70">Start making transactions to see your spending insights</p>
        </div>
      )}
    </div>
  )
}

