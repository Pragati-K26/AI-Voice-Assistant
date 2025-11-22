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
      <div className="glass rounded-2xl p-8 relative overflow-hidden animate-fadeInUp">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-gray-500/10"></div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-slate-400/20 rounded-full blur-2xl animate-float"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 gradient-text">Settings</h2>
              <p className="text-white/70">Manage your preferences and account settings</p>
            </div>
            <div className="glass rounded-full p-4">
              <SettingsIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="glass rounded-xl p-6 animate-fadeInUp stagger-1">
        <h3 className="text-xl font-bold text-white mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-white/10">
            <div>
              <p className="font-medium text-white/90">Username</p>
              <p className="text-sm text-white/70">{user?.username}</p>
            </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-white/10">
            <div>
              <p className="font-medium text-white/90">Email</p>
              <p className="text-sm text-white/70">{user?.email}</p>
            </div>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium text-white/90">Account Number</p>
              <p className="text-sm text-white/70">{user?.account_number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="glass rounded-xl p-6 animate-fadeInUp stagger-2">
        <h3 className="text-xl font-bold text-white mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white/90">Email Notifications</p>
              <p className="text-sm text-white/70">Receive email alerts for transactions</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? 'bg-blue-500' : 'bg-white/20'
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
              <p className="font-medium text-white/90">SMS Notifications</p>
              <p className="text-sm text-white/70">Receive SMS for important alerts</p>
            </div>
            <button
              onClick={() => setAutoPayEnabled(!autoPayEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoPayEnabled ? 'bg-blue-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoPayEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="glass rounded-xl p-6 animate-fadeInUp stagger-3">
        <h3 className="text-xl font-bold text-white mb-4">Security</h3>
        <div className="space-y-3">
          <button className="w-full glass-hover text-left p-4 rounded-lg transition-all duration-300 group">
            <p className="font-medium text-white/90 group-hover:text-blue-300">Change Password</p>
          </button>
          <button className="w-full glass-hover text-left p-4 rounded-lg transition-all duration-300 group">
            <p className="font-medium text-white/90 group-hover:text-blue-300">Update Voice PIN</p>
          </button>
          <button className="w-full glass-hover text-left p-4 rounded-lg transition-all duration-300 group">
            <p className="font-medium text-white/90 group-hover:text-blue-300">Two-Factor Authentication</p>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="glass rounded-xl p-6 animate-fadeInUp stagger-4">
        <button
          onClick={logout}
          className="w-full bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 text-white py-3 rounded-lg font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-blue"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

