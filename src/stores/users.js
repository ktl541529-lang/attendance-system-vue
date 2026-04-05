// src/stores/users.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from '@/api/users.js'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const loading = ref(false)

  async function fetchUsers() {
    loading.value = true
    try {
      const data = await getUsersApi()
      if (data.success) users.value = data.data
      return data
    } finally {
      loading.value = false
    }
  }

  async function createUser(payload) {
    const data = await createUserApi(payload)
    return data
  }

  async function updateUser(id, payload) {
    const data = await updateUserApi(id, payload)
    return data
  }

  async function deleteUser(id) {
    const data = await deleteUserApi(id)
    return data
  }

  return {
    users,
    loading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
})