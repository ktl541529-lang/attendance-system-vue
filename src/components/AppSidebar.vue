<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const isAdmin = computed(() => auth.isAdmin);

function navigate(path) {
  router.push(path);
}

async function doLogout() {
  await auth.logout();
  router.push('/login');
}
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">
          <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
        </div>
        <div class="sidebar-brand-text">
          <h2>某某醫院</h2>
          <p>人事管理系統</p>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-section">主選單</div>
      <div class="nav-item" :class="{ active: route.path === '/dashboard' }" @click="navigate('/dashboard')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
        總覽儀表板
      </div>

      <div class="nav-section">出勤管理</div>
      <div class="nav-item" :class="{ active: route.path === '/my-requests' }" @click="navigate('/my-requests')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
        我的申請
      </div>
      <div v-if="isAdmin" class="nav-item" :class="{ active: route.path === '/review' }" @click="navigate('/review')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        審核管理
      </div>
      <div v-if="isAdmin" class="nav-item" :class="{ active: route.path === '/all-records' }" @click="navigate('/all-records')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zm-4-4h2v-2H3v2zm10-16H7v2h6V1zm6 0v2h2c0-1.1-.9-2-2-2zM3 21c0 1.1.9 2 2 2v-2H3zm16 2c1.1 0 2-.9 2-2h-2v2zM3 9h2V7H3v2zm10 12h-2v2h2v-2zm6-12h2V7h-2v2zm0 12v-2h-2c0 1.1.9 2 2 2z"/></svg>
        全部記錄
      </div>

      <div class="nav-section">帳號管理</div>
      <div v-if="isAdmin" class="nav-item" :class="{ active: route.path === '/users' }" @click="navigate('/users')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        員工帳號
      </div>
      <div class="nav-item" :class="{ active: route.path === '/logs' }" @click="navigate('/logs')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
        操作紀錄
      </div>
    </nav>

    <div class="sidebar-footer">
      <div class="user-card">
        <div class="user-avatar">{{ auth.currentUser?.name?.slice(0, 1) }}</div>
        <div class="user-info">
          <div class="name">{{ auth.currentUser?.name }}</div>
          <div class="role-badge" :class="isAdmin ? 'role-admin' : 'role-employee'">
            {{ isAdmin ? '管理者' : '一般員工' }}
          </div>
        </div>
        <button class="logout-btn" @click="doLogout" title="登出">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>