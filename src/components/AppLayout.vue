<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';
import AppSidebar from './AppSidebar.vue';

const auth = useAuthStore();
const route = useRoute();

const pageTitle = computed(() => {
  const map = {
    '/dashboard': '總覽儀表板',
    '/my-requests': '我的申請',
    '/review': '審核管理',
    '/all-records': '全部記錄',
    '/users': '員工帳號管理',
    '/logs': '操作紀錄',
  };
  return map[route.path] || '';
});

const pageSub = computed(() => {
  const map = {
    '/dashboard': '您好，' + (auth.currentUser?.name || ''),
    '/my-requests': '管理您的出勤申請',
    '/review': '審核員工申請',
    '/all-records': '查閱所有申請記錄',
    '/users': '使用者帳號管理',
    '/logs': '稽核操作紀錄',
  };
  return map[route.path] || '';
});

const today = computed(() =>
  new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
  })
);
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