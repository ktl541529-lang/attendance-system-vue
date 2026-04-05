// src/stores/attendance.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getAttendanceApi,
  createAttendanceApi,
  updateAttendanceApi,
  deleteAttendanceApi,
  approveAttendanceApi,
  rejectAttendanceApi,
} from '@/api/attendance.js'

export const useAttendanceStore = defineStore('attendance', () => {
  const records = ref([])
  const loading = ref(false)
  const pagination = ref({ total: 0, page: 1, limit: 20, totalPages: 1 })
  const filter = ref({
    keyword: '', status: '', type: '', date_from: '', date_to: '',
  })

  async function fetchRecords(params = {}) {
    loading.value = true
    try {
      const data = await getAttendanceApi(params)
      if (data.success) {
        records.value = data.data
        if (data.pagination) {
          pagination.value = { ...pagination.value, ...data.pagination }
        }
      }
      return data
    } finally {
      loading.value = false
    }
  }

  async function createRecord(payload) {
    const data = await createAttendanceApi(payload)
    return data
  }

  async function updateRecord(id, payload) {
    const data = await updateAttendanceApi(id, payload)
    return data
  }

  async function deleteRecord(id) {
    const data = await deleteAttendanceApi(id)
    return data
  }

  async function approveRecord(id) {
    const data = await approveAttendanceApi(id)
    return data
  }

  async function rejectRecord(id, payload) {
    const data = await rejectAttendanceApi(id, payload)
    return data
  }

  function resetFilter() {
    filter.value = {
      keyword: '', status: '', type: '', date_from: '', date_to: '',
    }
  }

  return {
    records,
    loading,
    pagination,
    filter,
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    approveRecord,
    rejectRecord,
    resetFilter,
  }
})