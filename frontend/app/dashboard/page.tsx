'use client'

import { useState, useEffect } from 'react'
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
import ChartIcon from '@/components/icons/ChartIcon'
import CardIcon from '@/components/icons/CardIcon'
import BellIcon from '@/components/icons/BellIcon'
import MicIcon from '@/components/icons/MicIcon'
import SettingsIcon from '@/components/icons/SettingsIcon'
import OnboardingFlow from '@/components/OnboardingFlow'
import apiClient from '@/lib/api'
import { useRouter } from 'next/navigation'

function DashboardContent() {
  const { isAuthenticated, user, loading, token } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('voice') // Start with voice assistant
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  // Check if onboarding is needed
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!isAuthenticated || loading) return
      
      try {
        const response = await apiClient.get('/api/banking/spending/summary', {
          headers: { Authorization: `Bearer ${token}` },
        })
        
        const summary = response.data
        // If no transactions, show onboarding
        if (summary.total_spending === 0 && summary.total_income === 0) {
          setOnboardingComplete(false)
        } else {
          setOnboardingComplete(true)
        }
      } catch (error) {
        // No transactions, show onboarding
        setOnboardingComplete(false)
      } finally {
        setCheckingOnboarding(false)
      }
    }
    
    if (isAuthenticated && !loading) {
      checkOnboarding()
    }
  }, [isAuthenticated, loading])

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600 font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-slate-600 font-medium">Redirecting to login...</div>
        </div>
      </div>
    )
  }

  // Show onboarding if not complete
  if (!onboardingComplete) {
    return (
      <OnboardingFlow 
        onComplete={() => {
          setOnboardingComplete(true)
          // Switch to voice assistant tab after onboarding
          setActiveTab('voice')
        }} 
      />
    )
  }

  const tabs = [
    { id: 'voice', label: 'Voice Assistant', icon: <MicIcon />, primary: true },
    { id: 'dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { id: 'banking', label: 'Banking', icon: <BankIcon /> },
    { id: 'spending', label: 'Spending', icon: <ChartIcon /> },
    { id: 'cards', label: 'Cards', icon: <CardIcon /> },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon /> },
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-serif font-bold text-slate-900">
                {activeTab === 'voice' ? '🎤 AI Voice Banking Assistant' : 'VoiceBank Dashboard'}
              </h1>
              <p className="text-sm text-slate-600">
                {activeTab === 'voice' 
                  ? 'Speak naturally to perform banking operations'
                  : `Welcome, ${user?.username}`
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-slate-50 rounded-xl px-4 py-2 text-right border border-slate-200">
                <p className="text-xs text-slate-600 uppercase tracking-wide">Balance</p>
                <p className="text-xl font-bold text-slate-900">
                  ₹{user?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-[73px] z-40 shadow-sm">
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

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
}

