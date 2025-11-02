'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import SettingsIcon from './icons/SettingsIcon'

export default function Settings() {
  const { user, logout } = useAuth()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoPayEnabled, setAutoPayEnabled] = useState(true)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Settings</h2>
            <p className="text-gray-200">Manage your preferences and account settings</p>
          </div>
          <div className="bg-white/20 rounded-full p-4">
            <SettingsIcon />
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">Username</p>
              <p className="text-sm text-gray-600">{user?.username}</p>
            </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium text-gray-900">Account Number</p>
              <p className="text-sm text-gray-600">{user?.account_number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive email alerts for transactions</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-600">Receive SMS for important alerts</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Security</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
            <p className="font-medium text-gray-900 group-hover:text-blue-600">Change Password</p>
          </button>
          <button className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
            <p className="font-medium text-gray-900 group-hover:text-blue-600">Update Voice PIN</p>
          </button>
          <button className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
            <p className="font-medium text-gray-900 group-hover:text-blue-600">Two-Factor Authentication</p>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

