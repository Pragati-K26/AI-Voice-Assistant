'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import BellIcon from './icons/BellIcon'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-voice-assistant-evgf.onrender.com'

export default function NotificationsTab() {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/banking/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(response.data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return '🔴'
      case 'medium':
        return '🟡'
      case 'info':
        return '🔵'
      default:
        return '⚪'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-700'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass rounded-2xl p-8 animate-fadeInScale">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-8 h-8 border-[3px] border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-8 h-8 border-[3px] border-teal-400/20 border-t-teal-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <div className="text-white font-medium text-lg animate-pulse">Loading notifications...</div>
          </div>
        </div>
      </div>
    )
  }

  const getSeverityGlassColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-400/50 bg-red-500/10'
      case 'medium':
        return 'border-yellow-400/50 bg-yellow-500/10'
      case 'info':
        return 'border-blue-400/50 bg-blue-500/10'
      default:
        return 'border-white/20 bg-white/5'
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-8 relative overflow-hidden animate-fadeInUp">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10"></div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-green-400/20 rounded-full blur-2xl animate-float"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 gradient-text">Notifications</h2>
              <p className="text-white/70">Stay informed about your account activity</p>
            </div>
            <div className="glass rounded-full p-4">
              <BellIcon />
            </div>
          </div>
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`glass border-l-4 rounded-lg p-6 animate-slideInRight ${getSeverityGlassColor(notification.severity)}`}
              style={{ animationDelay: `${index * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getSeverityIcon(notification.severity)}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-white">{notification.title}</h3>
                    <p className="mb-2 text-white/80">{notification.message}</p>
                    {notification.action_required && (
                      <span className="inline-block px-3 py-1 bg-red-500/80 text-white text-xs font-medium rounded-full">
                        Action Required
                      </span>
                    )}
                  </div>
                </div>
                <button className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-12 text-center animate-fadeInScale">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
          <p className="text-white/70">You have no new notifications</p>
        </div>
      )}
    </div>
  )
}

