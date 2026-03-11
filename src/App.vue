<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth.js';

const auth = useAuthStore();
const router = useRouter();

onMounted(async () => {
  if (auth.token) {
    try {
      await auth.fetchMe();
      if (!auth.isLoggedIn) router.push('/login');
    } catch {
      router.push('/login');
    }
  }
});
</script>

<template>
  <RouterView />
</template>