// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, logoutApi, fetchMeApi } from '@/api/auth.js'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isInitialized = ref(false)

  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  // 修正：token 存在就先視為登入，等 fetchMe 完成後才是完整狀態
  const isLoggedIn = computed(() => !!token.value)
  const isReady = computed(() => isInitialized.value)

  async function login(account, password) {
    const data = await loginApi(account, password)
    if (data.success) {
      token.value = data.token
      currentUser.value = data.user
      localStorage.setItem('token', data.token)
    }
    return data
  }

  async function logout() {
    try { await logoutApi() } catch {}
    currentUser.value = null
    token.value = null
    isInitialized.value = false
    localStorage.removeItem('token')
  }

  async function fetchMe() {
    try {
      const data = await fetchMeApi()
      if (data.success) {
        currentUser.value = data.user
      } else {
        // token 無效，清除
        token.value = null
        localStorage.removeItem('token')
      }
    } catch {
      token.value = null
      localStorage.removeItem('token')
    } finally {
      isInitialized.value = true
    }
  }

  return {
    currentUser,
    token,
    isAdmin,
    isLoggedIn,
    isReady,
    login,
    logout,
    fetchMe,
  }
})