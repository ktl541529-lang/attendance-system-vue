import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: 'https://attendance-system-p71q.onrender.com/api',
  timeout: 10000
})

// Request interceptor：每次自動帶 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor：401 自動登出
api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    return Promise.reject(err)
  }
)

export default api