import { api } from './client'
import { CreateClientInput, UpdateClientInput } from '@agiota/shared'

export async function fetchClients(search?: string) {
  const res = await api.get('/clients', { params: { search } })
  return res.data
}

export async function fetchClient(id: string) {
  const res = await api.get(`/clients/${id}`)
  return res.data
}

export async function createClient(data: CreateClientInput) {
  const res = await api.post('/clients', data)
  return res.data
}

export async function updateClient(id: string, data: UpdateClientInput) {
  const res = await api.patch(`/clients/${id}`, data)
  return res.data
}

export async function deleteClient(id: string) {
  await api.delete(`/clients/${id}`)
}
