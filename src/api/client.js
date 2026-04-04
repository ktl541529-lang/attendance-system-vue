// src/api/client.js
import axios from 'axios'
import router from '@/router'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://attendance-system-p71q.onrender.com/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch (err) {
      console.warn('localStorage not available:', err)
    }
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      try { localStorage.removeItem('token') } catch {}
      router?.push?.('/login')
    }
    return Promise.reject(error)
  }
)

export default apiClient