// src/composables/useToast.js
import { ref } from 'vue'

const toasts = ref([])

export function useToast() {
  function addToast(type, msg, duration = 3500) {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, type, msg })
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }

  const toast = {
    success: (msg) => addToast('success', msg),
    error:   (msg) => addToast('error', msg),
    info:    (msg) => addToast('info', msg),
  }

  return { toasts, toast }
}