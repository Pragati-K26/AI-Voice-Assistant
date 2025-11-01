'use client'

import { useState, useEffect } from 'react'
import VoiceAssistant from '@/components/VoiceAssistant'
import Login from '@/components/Login'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

function MainContent() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return <VoiceAssistant />
}

export default function Home() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  )
}

