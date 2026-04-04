<!-- src/components/layout/AppLayout.vue -->
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import AppSidebar from './AppSidebar.vue'
import { PAGE_META } from '@/constants/routes.js'

const auth = useAuthStore()
const route = useRoute()

const pageMeta = computed(() => PAGE_META[route.path] || { title: '', sub: () => '' })
const pageTitle = computed(() => pageMeta.value.title)
const pageSub = computed(() => pageMeta.value.sub(auth.currentUser))

const today = computed(() =>
  new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
  })
)
</script>

<template>
  <div class="app">
    <AppSidebar />
    <div class="main">
      <div class="topbar">
        <div>
          <div class="topbar-title">{{ pageTitle }}</div>
          <div class="topbar-subtitle">{{ pageSub }}</div>
        </div>
        <div class="topbar-actions">
          <span class="chip">{{ auth.currentUser?.dept }}</span>
          <span class="text-sm text-mono">{{ today }}</span>
        </div>
      </div>
      <div class="content">
        <slot />
      </div>
    </div>
  </div>
</template>