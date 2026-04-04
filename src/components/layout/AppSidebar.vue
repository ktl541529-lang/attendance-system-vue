<!-- src/components/layout/AppSidebar.vue -->
<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { NAV_ROUTES } from '@/constants/routes.js'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isAdmin = computed(() => auth.isAdmin)

const visibleRoutes = computed(() =>
  NAV_ROUTES.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.adminOnly || isAdmin.value),
  })).filter((section) => section.items.length > 0)
)

function navigate(path) {
  router.push(path)
}

async function doLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">
          <svg viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
          </svg>
        </div>
        <div class="sidebar-brand-text">
          <h2>考勤系統</h2>
          <p>出勤管理平台</p>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <template v-for="section in visibleRoutes" :key="section.section">
        <div class="nav-section">{{ section.section }}</div>
        <div
          v-for="item in section.items"
          :key="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
          @click="navigate(item.path)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" v-html="item.icon" />
          {{ item.label }}
        </div>
      </template>
    </nav>

    <div class="sidebar-footer">
      <div class="user-card">
        <div class="user-avatar">{{ auth.currentUser?.name?.slice(0, 1) }}</div>
        <div class="user-info">
          <div class="name">{{ auth.currentUser?.name }}</div>
          <div class="role-badge" :class="isAdmin ? 'role-admin' : 'role-employee'">
            {{ isAdmin ? '管理員' : '一般員工' }}
          </div>
        </div>
        <button class="logout-btn" @click="doLogout" title="登出">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>