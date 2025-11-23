/**
 * API utility with error handling
 */
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-voice-assistant-evgf.onrender.com'

// Create axios instance with custom error handling
const apiClient = axios.create({
  baseURL: API_URL,
  validateStatus: (status) => {
    // Don't throw for 401 (unauthorized) - expected when not logged in
    return status < 500
  },
})

// Response interceptor to silently handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silently handle 401 errors (expected when not logged in)
    if (error.response?.status === 401) {
      // Don't log to console - these are expected
      return Promise.reject(error)
    }
    // Log other errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error)
    }
    return Promise.reject(error)
  }
)

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default apiClient
export { API_URL }



