import { api } from './client'

export interface DashboardSummary {
  totalActive: number
  totalReturned: number
  monthlyReturns: number
  dueTodayCount: number
  dueTomorrowCount: number
  overdueCount: number
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await api.get('/dashboard/summary')
  return res.data
}
