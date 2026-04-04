// src/api/requests.js
import client from './client.js'

export const getRequestsApi = () => client.get('/requests')
export const submitRequestApi = (payload) => client.post('/requests', payload)
export const reviewRequestApi = (id, payload) => client.patch(`/requests/${id}`, payload)