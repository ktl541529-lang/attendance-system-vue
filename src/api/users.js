// src/api/users.js
import client from './client.js'

export const getUsersApi = () => client.get('/users')