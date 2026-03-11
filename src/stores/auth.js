import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '../api/index.js';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null);
  const token = ref(localStorage.getItem('token') || null);

  const isAdmin = computed(() => currentUser.value?.role === 'admin');
  const isLoggedIn = computed(() => !!token.value && !!currentUser.value);

  async function login(account, password) {
    const data = await api('POST', '/auth/login', { account, password });
    if (data.success) {
      token.value = data.token;
      currentUser.value = data.user;
      localStorage.setItem('token', data.token);
    }
    return data;
  }

  async function logout() {
    try { await api('POST', '/auth/logout'); } catch {}
    currentUser.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }

  async function fetchMe() {
    const data = await api('GET', '/auth/me');
    if (data.success) currentUser.value = data.user;
    return data;
  }

  return { currentUser, token, isAdmin, isLoggedIn, login, logout, fetchMe };
});