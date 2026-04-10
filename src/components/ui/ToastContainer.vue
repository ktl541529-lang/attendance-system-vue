<!-- src/components/ui/ToastContainer.vue -->
<script setup>
import { useToast } from '@/composables/useToast.js'
const { toasts } = useToast()

function getIcon(type) {
  if (type === 'success') return '✓'
  if (type === 'error') return '✗'
  return '!'
}
</script>

<template>
  <div class="toast-container">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast"
      :class="'toast-' + t.type"
    >
      <span>{{ getIcon(t.type) }}</span>{{ t.msg }}
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}
</style>