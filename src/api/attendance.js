// src/api/attendance.js
import client from './client.js'

export const getAttendanceApi = (params) =>
  client.get('/attendance', { params })

export const createAttendanceApi = (payload) =>
  client.post('/attendance', payload)

export const updateAttendanceApi = (id, payload) =>
  client.put(`/attendance/${id}`, payload)

export const deleteAttendanceApi = (id) =>
  client.delete(`/attendance/${id}`)

export const approveAttendanceApi = (id) =>
  client.patch(`/attendance/${id}/approve`)

export const rejectAttendanceApi = (id, payload) =>
  client.patch(`/attendance/${id}/reject`, payload)