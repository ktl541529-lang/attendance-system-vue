// src/api/users.js
import client from './client.js'

export const getUsersApi = () => client.get('/users')
export const createUserApi = (payload) => client.post('/users', payload)
export const updateUserApi = (id, payload) => client.put(`/users/${id}`, payload)
export const deleteUserApi = (id) => client.delete(`/users/${id}`)