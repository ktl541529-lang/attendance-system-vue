<script setup>
import { useAuthStore } from '@/stores/auth.js'
import ToastContainer from '@/components/ui/ToastContainer.vue'
const auth = useAuthStore()
</script>

<template>
  <div v-if="auth.isReady">
    <ToastContainer />
    <RouterView />
  </div>
  <div v-else style="display:flex; align-items:center; justify-content:center; height:100vh;">
    <span class="loading-spinner" style="width:32px; height:32px; border-width:3px;"></span>
  </div>
</template>