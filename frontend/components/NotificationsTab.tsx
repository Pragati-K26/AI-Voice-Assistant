'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import BellIcon from './icons/BellIcon'

const API_URL = process.env.API_URL || 'http://localhost:8000'

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
        <div className="text-gray-500">Loading notifications...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Notifications</h2>
            <p className="text-green-100">Stay informed about your account activity</p>
          </div>
          <div className="bg-white/20 rounded-full p-4">
            <BellIcon />
          </div>
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`border-l-4 rounded-lg p-6 ${getSeverityColor(notification.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getSeverityIcon(notification.severity)}</div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{notification.title}</h3>
                    <p className="mb-2">{notification.message}</p>
                    {notification.action_required && (
                      <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-full">
                        Action Required
                      </span>
                    )}
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
          <p className="text-gray-600">You have no new notifications</p>
        </div>
      )}
    </div>
  )
}

