'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-voice-assistant-evgf.onrender.com'

interface User {
  id: number
  username: string
  email: string
  account_number: string
  balance: number
  credit_limit?: number
  savings?: number
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      fetchUser(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async (authToken: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setUser(response.data)
      setIsAuthenticated(true)
    } catch (error) {
      localStorage.removeItem('token')
      setToken(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
      const params = new URLSearchParams()
      params.append('username', username.trim())
      params.append('password', password)

      console.log('Attempting login to:', `${API_URL}/api/auth/login`)
      console.log('API_URL from env:', process.env.NEXT_PUBLIC_API_URL)
      console.log('Username:', username.trim())

      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: false, // Don't send cookies
        }
      )

      console.log('Login response status:', response.status)
      console.log('Login response data:', response.data)

      const { access_token } = response.data
      if (!access_token) {
        throw new Error('No access token received from server')
      }

      setToken(access_token)
      localStorage.setItem('token', access_token)

      try {
        await fetchUser(access_token);
      } catch (e) {
        // Demo user may not exist in DB; ignore fetch error
        console.warn('Demo user fetch failed, proceeding with token only');
        // For demo user, set a mock user object
        if (!user) {
          setUser({
            id: 0,
            username: 'demo_user',
            email: 'demo@example.com',
            account_number: 'DEMO12345',
            balance: 0.0,
          })
          setIsAuthenticated(true)
        }
      }
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        }
      })
      
      let errorMessage = 'Login failed'
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password. Please check your credentials.'
      } else if (error.response?.status === 0 || error.message?.includes('Network')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection and try again.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      throw new Error(errorMessage)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, token, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

