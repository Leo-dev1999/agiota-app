import axios from 'axios'

const authApi = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

export async function login(username: string, password: string) {
  const res = await authApi.post('/auth/login', { username, password })
  return res.data as { token: string; user: { userId: string; role: string; tenantId: string | null; username: string } }
}

export async function fetchAdminUsers() {
  const { api } = await import('./client')
  const res = await api.get('/admin/users')
  return res.data
}

export async function createAdminUser(data: { username: string; password: string; role: string; tenantId?: string }) {
  const { api } = await import('./client')
  const res = await api.post('/admin/users', data)
  return res.data
}

export async function toggleAdminUser(id: string) {
  const { api } = await import('./client')
  const res = await api.patch(`/admin/users/${id}/toggle`)
  return res.data
}

export async function changeAdminPassword(id: string, password: string) {
  const { api } = await import('./client')
  const res = await api.patch(`/admin/users/${id}/password`, { password })
  return res.data
}

export async function fetchAdminTenants() {
  const { api } = await import('./client')
  const res = await api.get('/admin/tenants')
  return res.data
}
