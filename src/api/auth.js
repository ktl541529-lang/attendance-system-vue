// src/api/auth.js
import client from './client.js'

export const loginApi = (account, password) =>
  client.post('/auth/login', { account, password })

export const logoutApi = () =>
  client.post('/auth/logout')

export const fetchMeApi = () =>
  client.get('/auth/me')