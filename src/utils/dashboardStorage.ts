import type { DashboardStats } from '../types/dashboard'
import { api } from '../lib/api'

export async function getDashboardStats(): Promise<DashboardStats> {
  return api.getDashboardStats()
}
