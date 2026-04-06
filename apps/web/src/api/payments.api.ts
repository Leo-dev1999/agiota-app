import { api } from './client'
import { MarkAsPaidInput } from '@agiota/shared'

export async function fetchPayments(filters?: { status?: string; loanId?: string }) {
  const res = await api.get('/payments', { params: filters })
  return res.data
}

export async function fetchTodayPayments() {
  const res = await api.get('/payments/today')
  return res.data
}

export async function fetchTomorrowPayments() {
  const res = await api.get('/payments/tomorrow')
  return res.data
}

export async function fetchOverduePayments() {
  const res = await api.get('/payments/overdue')
  return res.data
}

export async function markAsPaid(id: string, data: MarkAsPaidInput) {
  const res = await api.patch(`/payments/${id}/pay`, data)
  return res.data
}
