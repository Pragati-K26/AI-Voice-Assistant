'use client'

import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import { useEffect, useState } from 'react'
import MicIcon from './icons/MicIcon'
import BellIcon from './icons/BellIcon'

const API_URL = process.env.API_URL || 'http://localhost:8000'

export default function DashboardOverview() {
  const { user, token } = useAuth()
  const [spendingSummary, setSpendingSummary] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchDashboardData()
    }
  }, [token])

  const fetchDashboardData = async () => {
    try {
      const [spendingResponse, notificationsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/banking/spending/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/banking/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ])

      setSpendingSummary(spendingResponse.data)
      setNotifications(notificationsResponse.data.notifications || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-100 font-medium">Account Balance</h3>
            <div className="bg-white/20 rounded-lg p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold">
            ₹{user?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="mt-2 text-sm text-blue-100">
            Account: {user?.account_number}
          </div>
        </div>

        {/* Spending Card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-orange-100 font-medium">This Month Spending</h3>
            <div className="bg-white/20 rounded-lg p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold">
            ₹{spendingSummary?.total_spending?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div className="mt-2 text-sm text-orange-100">
            Savings: ₹{spendingSummary?.savings?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
        </div>

        {/* Notifications Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-green-100 font-medium">Notifications</h3>
            <div className="bg-white/20 rounded-lg p-2">
              <BellIcon />
            </div>
          </div>
          <div className="text-3xl font-bold">
            {notifications.length}
          </div>
          <div className="mt-2 text-sm text-green-100">
            {notifications.filter(n => n.action_required).length} require action
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {/* Mock transaction - in production, fetch from API */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 rounded-full p-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Transfer to Akash</p>
                <p className="text-sm text-gray-500">Today, 10:35 AM</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-red-600">-₹5,000</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Salary Credit</p>
                <p className="text-sm text-gray-500">Jan 1, 9:00 AM</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">+₹50,000</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
        <button className="mt-4 w-full py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
          View All Transactions →
        </button>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Transfer', icon: '💰', color: 'blue' },
            { label: 'Pay Bills', icon: '💳', color: 'green' },
            { label: 'View Loans', icon: '📊', color: 'purple' },
            { label: 'Settings', icon: '⚙️', color: 'gray' },
          ].map((action) => (
            <button
              key={action.label}
              className={`p-4 rounded-lg border-2 border-${action.color}-200 hover:border-${action.color}-400 bg-${action.color}-50 hover:bg-${action.color}-100 transition-all group`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <div className={`font-medium text-${action.color}-900 group-hover:scale-105 transition-transform`}>
                {action.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

