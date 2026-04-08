// src/api/logs.js
import client from './client.js'

export const getLogsApi = () => client.get('/logs')
export const getAuditLogsApi = (params) => client.get('/users/audit-logs', { params })
export const getMyLogsApi = (params) => client.get('/logs/my', { params })