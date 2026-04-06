import { api } from './client'
import { CreateLoanInput, LoanStatus } from '@agiota/shared'

export async function fetchLoans(filters?: { status?: string; clientId?: string; billingType?: string }) {
  const res = await api.get('/loans', { params: filters })
  return res.data
}

export async function fetchLoan(id: string) {
  const res = await api.get(`/loans/${id}`)
  return res.data
}

export async function createLoan(data: CreateLoanInput) {
  const res = await api.post('/loans', data)
  return res.data
}

export async function updateLoanStatus(id: string, status: LoanStatus) {
  const res = await api.patch(`/loans/${id}/status`, { status })
  return res.data
}

export async function deleteLoan(id: string) {
  await api.delete(`/loans/${id}`)
}
