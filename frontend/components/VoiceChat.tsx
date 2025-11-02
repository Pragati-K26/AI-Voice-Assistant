'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import MicIcon from './icons/MicIcon'

const API_URL = process.env.API_URL || 'http://localhost:8000'

interface Message {
  type: 'user' | 'assistant'
  text: string
  intent?: string
  timestamp: Date
}

export default function VoiceChat() {
  const { user, token } = useAuth()
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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

        if (interimTranscript) {
          setTranscript(interimTranscript)
        } else if (finalTranscript) {
          setTranscript(finalTranscript.trim())
        }

        if (finalTranscript.trim()) {
          processVoiceInput(finalTranscript.trim())
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
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
        }
        setMessages((prev) => [
          ...prev,
          { type: 'assistant', text: errorMessage, timestamp: new Date() },
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
        { text, session_id: sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const { response_text, intent, session_id } = response.data
      if (session_id) setSessionId(session_id)

      setMessages((prev) => [
        ...prev,
        { type: 'assistant', text: response_text, intent, timestamp: new Date() },
      ])
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Sorry, I encountered an error. Please try again.'
      setMessages((prev) => [
        ...prev,
        { type: 'assistant', text: errorMessage, timestamp: new Date() },
      ])
    } finally {
      setIsProcessing(false)
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
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 text-white mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Voice Assistant</h2>
            <p className="text-blue-100">Talk to your banking assistant</p>
          </div>
          <div className="bg-white/20 rounded-full p-3">
            <MicIcon />
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto mb-4 bg-white rounded-lg p-4 shadow-inner">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-6xl mb-4">👋</div>
              <p className="text-lg font-medium text-gray-700 mb-2">Hello! I'm your voice banking assistant.</p>
              <p className="text-sm text-gray-500">Try saying: "Check my balance" or "Show my spending summary"</p>
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
                  {message.intent && message.type === 'assistant' && (
                    <p className="text-xs mt-1 opacity-75">Intent: {message.intent}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex items-center space-x-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
        >
          {isListening ? (
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 9a1 1 0 10-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
            </svg>
          ) : (
            <MicIcon />
          )}
        </button>

        <div className="flex-1">
          <input
            type="text"
            placeholder={isListening ? 'Listening...' : 'Type your message or click mic to speak'}
            value={transcript}
            onChange={handleTextChange}
            readOnly={isListening}
            onKeyDown={handleTextInput}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {isProcessing && (
            <p className="text-xs text-blue-600 mt-1">Processing...</p>
          )}
        </div>
      </div>

      {isListening && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center space-x-2 text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Listening...</span>
          </div>
        </div>
      )}
    </div>
  )
}

