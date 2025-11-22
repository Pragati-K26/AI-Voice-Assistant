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
        <div className="glass rounded-2xl p-8 animate-fadeInScale">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-8 h-8 border-[3px] border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-8 h-8 border-[3px] border-purple-400/20 border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <div className="text-white font-medium text-lg animate-pulse">Loading your dashboard...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 min-h-screen">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div 
          className="group glass-hover rounded-2xl p-6 relative overflow-hidden animate-fadeInUp stagger-1"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-400/10 animate-shimmer"></div>
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl animate-float"></div>
          <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-cyan-400/15 rounded-full blur-xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-blue-100/90 font-medium text-sm uppercase tracking-wide">Account Balance</h3>
              <div className="glass rounded-xl p-2 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-blue-300 group-hover:text-blue-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2 gradient-text">
              ₹{user?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <div className="text-blue-100/70 text-sm flex items-center gap-2">
              <span>Account:</span>
              <span className="font-mono text-blue-200/90">{user?.account_number}</span>
            </div>
          </div>
        </div>

        {/* Spending Card */}
        <div 
          className="group glass-hover rounded-2xl p-6 relative overflow-hidden animate-fadeInUp stagger-2"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
          <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-pink-400/15 rounded-full blur-xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-purple-100/90 font-medium text-sm uppercase tracking-wide">This Month Spending</h3>
              <div className="glass rounded-xl p-2 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-purple-300 group-hover:text-purple-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2 gradient-text">
              ₹{spendingSummary?.total_spending?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <div className="text-purple-100/70 text-sm flex items-center gap-2">
              <span>Savings:</span>
              <span className="font-semibold text-purple-200/90">₹{spendingSummary?.savings?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div 
          className="group glass-hover rounded-2xl p-6 relative overflow-hidden animate-fadeInUp stagger-3"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-400/10"></div>
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-400/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-4 left-4 w-12 h-12 bg-teal-400/15 rounded-full blur-xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-emerald-100/90 font-medium text-sm uppercase tracking-wide">Notifications</h3>
              <div className="glass rounded-xl p-2 group-hover:scale-110 transition-transform duration-300 relative">
                <BellIcon />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2 gradient-text">
              {notifications.length}
            </div>
            <div className="text-emerald-100/70 text-sm flex items-center gap-2">
              <span>{notifications.filter(n => n.action_required).length}</span>
              <span className="text-emerald-200/90 font-medium">require action</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div 
        className="glass rounded-2xl p-6 relative overflow-hidden animate-fadeInUp stagger-4"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-700/20"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16 blur-2xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full translate-y-8 -translate-x-8 blur-xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <span className="glass rounded-lg p-2 mr-3 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </span>
              <span className="gradient-text">Recent Transactions</span>
            </h2>
          </div>
          <div className="space-y-3">
            {/* Mock transaction */}
            <div 
              className="group glass rounded-xl p-4 hover:bg-white/10 transition-all duration-300 animate-slideInRight"
              style={{
                animationDelay: '0.5s',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="glass rounded-lg p-2.5 group-hover:scale-110 transition-transform duration-300 bg-red-500/20 border-red-400/30">
                    <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">Transfer to Akash</p>
                    <p className="text-sm text-white/60">Today, 10:35 AM</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-300">-₹5,000</p>
                  <p className="text-xs text-white/50">Completed</p>
                </div>
              </div>
            </div>

            <div 
              className="group glass rounded-xl p-4 hover:bg-white/10 transition-all duration-300 animate-slideInRight"
              style={{
                animationDelay: '0.7s',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="glass rounded-lg p-2.5 group-hover:scale-110 transition-transform duration-300 bg-green-500/20 border-green-400/30">
                    <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-white">Salary Credit</p>
                    <p className="text-sm text-white/60">Jan 1, 9:00 AM</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-300">+₹50,000</p>
                  <p className="text-xs text-white/50">Completed</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button 
              className="glass-hover px-8 py-3 text-white/90 hover:text-white rounded-xl font-medium text-sm hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                View All Transactions
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div 
        className="glass rounded-2xl p-6 relative overflow-hidden animate-fadeInUp stagger-5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-400/15 rounded-full -translate-x-8 translate-y-8 blur-2xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/15 rounded-full translate-x-8 -translate-y-8 blur-xl"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <span className="glass rounded-lg p-2 mr-3">
              <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span className="gradient-text">Quick Actions</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Transfer', icon: '💰', color: 'from-blue-500/15 to-cyan-500/10', delay: '0.1s' },
              { label: 'Pay Bills', icon: '💳', color: 'from-purple-500/15 to-pink-500/10', delay: '0.2s' },
              { label: 'View Loans', icon: '📊', color: 'from-emerald-500/15 to-teal-500/10', delay: '0.3s' },
              { label: 'Settings', icon: '⚙️', color: 'from-slate-600/15 to-slate-500/10', delay: '0.4s' },
            ].map((action, idx) => (
              <button
                key={action.label}
                className="glass-hover bg-gradient-to-br group rounded-xl p-5 text-center transition-all duration-300 relative overflow-hidden animate-fadeInUp"
                style={{
                  background: `linear-gradient(135deg, ${action.color.includes('blue') ? 'rgba(59, 130, 246, 0.15)' : action.color.includes('purple') ? 'rgba(168, 85, 247, 0.15)' : action.color.includes('emerald') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(71, 85, 105, 0.15)'}, ${action.color.includes('cyan') ? 'rgba(6, 182, 212, 0.1)' : action.color.includes('pink') ? 'rgba(236, 72, 153, 0.1)' : action.color.includes('teal') ? 'rgba(20, 184, 166, 0.1)' : 'rgba(100, 116, 139, 0.1)'})`,
                  animationDelay: action.delay
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 40px 0 rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.2)';
                }}
              >
                <div className="relative z-10">
                  <div className="text-3xl mb-3 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    {action.icon}
                  </div>
                  <div className="font-medium text-white/90 group-hover:text-white text-sm">
                    {action.label}
                  </div>
                </div>
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ animationFillMode: 'forwards' }}
                ></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}