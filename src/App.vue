<!-- src/App.vue -->
<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const auth = useAuthStore()
const router = useRouter()

onMounted(async () => {
  if (auth.token) {
    await auth.fetchMe()
    if (!auth.isLoggedIn) router.push('/login')
  } else {
    auth.isInitialized = true
  }
})
</script>

<template>
  <div v-if="!auth.token || auth.isReady">
    <RouterView />
  </div>
  <div v-else style="display:flex; align-items:center; justify-content:center; height:100vh;">
    <span class="loading-spinner" style="width:32px; height:32px; border-width:3px;"></span>
  </div>
</template>