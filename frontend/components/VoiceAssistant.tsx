'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-voice-assistant-evgf.onrender.com'

interface Message {
  type: 'user' | 'assistant'
  text: string
  intent?: string
  timestamp: Date
}

export default function VoiceAssistant() {
  const { user, token, logout } = useAuth()
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-IN'

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        // Update transcript display in real-time
        if (interimTranscript) {
          setTranscript(interimTranscript)
        } else if (finalTranscript) {
          setTranscript(finalTranscript.trim())
        }

        // Process final transcript
        if (finalTranscript.trim()) {
          processVoiceInput(finalTranscript.trim())
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setTranscript('')
        
        // Provide user-friendly error messages
        let errorMessage = 'Speech recognition error occurred'
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.'
            break
          case 'audio-capture':
            errorMessage = 'Microphone not found. Please check your microphone settings.'
            break
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.'
            break
          case 'network':
            errorMessage = 'Network error. Please check your connection.'
            break
        }
        
        setMessages((prev) => [
          ...prev,
          {
            type: 'assistant',
            text: errorMessage,
            timestamp: new Date(),
          },
        ])
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setIsListening(true)
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        setIsListening(false)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const processVoiceInput = async (text: string) => {
    if (!text.trim() || isProcessing) return

    setIsProcessing(true)
    setMessages((prev) => [...prev, { type: 'user', text, timestamp: new Date() }])

    try {
      const response = await axios.post(
        `${API_URL}/api/voice/process`,
        {
          text,
          session_id: sessionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const { response_text, intent, session_id, action } = response.data

      if (session_id) {
        setSessionId(session_id)
      }

      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          text: response_text,
          intent,
          timestamp: new Date(),
        },
      ])

      // Handle actions (like transfers)
      if (action && action.action === 'transfer_funds' && action.requires_otp) {
        // OTP will be handled in next voice input
        setMessages((prev) => [
          ...prev,
          {
            type: 'assistant',
            text: 'Please speak the OTP sent to your mobile number.',
            timestamp: new Date(),
          },
        ])
      }
    } catch (error: any) {
      console.error('Error processing voice input:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Sorry, I encountered an error. Please try again.'
      setMessages((prev) => [
        ...prev,
        {
          type: 'assistant',
          text: errorMessage,
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsProcessing(false)
      // Clear transcript after a short delay to let user see what was processed
      setTimeout(() => setTranscript(''), 1000)
    }
  }

  const handleTextInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() && !isListening) {
      const inputValue = e.currentTarget.value.trim()
      setTranscript('')
      processVoiceInput(inputValue)
      e.currentTarget.value = ''
    }
  }
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isListening) {
      setTranscript(e.target.value)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Voice Banking Assistant</h1>
              <p className="text-sm text-gray-600">
                Welcome, {user?.username} | Account: {user?.account_number}
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Account Balance</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                ₹{user?.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Credit Limit</p>
              <p className="text-xl font-semibold text-gray-700 mt-1">
                ₹{user?.credit_limit?.toLocaleString('en-IN') || '50,000'}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">👋 Hello! I'm your voice banking assistant.</p>
                <p className="text-sm">Try saying: "Check my balance" or "Transfer ₹1000 to Rahul"</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    {message.intent && (
                      <p className="text-xs mt-1 opacity-75">
                        Intent: {message.intent}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Voice Input Area */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-4">
            {/* Voice Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
              className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? (
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 9a1 1 0 10-2 0v2a1 1 0 102 0V9z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Text Input */}
            <div className="flex-1">
              <input
                type="text"
                placeholder={
                  isListening
                    ? 'Listening...'
                    : 'Type your message or click mic to speak'
                }
                value={transcript}
                onChange={handleTextChange}
                readOnly={isListening}
                onKeyDown={handleTextInput}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {isProcessing && (
                <p className="text-xs text-gray-500 mt-1">Processing...</p>
              )}
            </div>
          </div>

          {isListening && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 text-red-600">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Listening...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'Check balance',
            'View transactions',
            'Loan inquiry',
            'Interest rates',
          ].map((action) => (
            <button
              key={action}
              onClick={() => processVoiceInput(action)}
              disabled={isProcessing}
              className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow text-sm font-medium text-gray-700 disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

