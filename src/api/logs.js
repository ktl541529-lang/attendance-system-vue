// src/api/logs.js
import client from './client.js'

export const getLogsApi = () => client.get('/logs')