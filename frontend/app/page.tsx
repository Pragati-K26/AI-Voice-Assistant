'use client'

import { useState } from 'react'
import VoiceAssistant from '@/components/VoiceAssistant'
import Login from '@/components/Login'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Tabs from '@/components/Tabs'
import DashboardOverview from '@/components/DashboardOverview'
import BankingServices from '@/components/BankingServices'
import SpendingInsights from '@/components/SpendingInsights'
import CardsAndServices from '@/components/CardsAndServices'
import NotificationsTab from '@/components/NotificationsTab'
import VoiceChat from '@/components/VoiceChat'
import Settings from '@/components/Settings'
import HomeIcon from '@/components/icons/HomeIcon'
import BankIcon from '@/components/icons/BankIcon'
import MoneyIcon from '@/components/icons/MoneyIcon'
import CardIcon from '@/components/icons/CardIcon'
import ChartIcon from '@/components/icons/ChartIcon'
import BellIcon from '@/components/icons/BellIcon'
import MicIcon from '@/components/icons/MicIcon'
import SettingsIcon from '@/components/icons/SettingsIcon'

function MainContent() {
  const { isAuthenticated, user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { id: 'banking', label: 'Banking', icon: <BankIcon /> },
    { id: 'spending', label: 'Spending', icon: <ChartIcon /> },
    { id: 'cards', label: 'Cards', icon: <CardIcon /> },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon /> },
    { id: 'voice', label: 'Voice Assistant', icon: <MicIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />
      case 'banking':
        return <BankingServices />
      case 'spending':
        return <SpendingInsights />
      case 'cards':
        return <CardsAndServices />
      case 'notifications':
        return <NotificationsTab />
      case 'voice':
        return <VoiceChat />
      case 'settings':
        return <Settings />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Voice Banking Assistant</h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.username}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Balance</p>
                <p className="text-lg font-bold text-gray-800">
                  ₹{user?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b sticky top-[73px] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  )
}
