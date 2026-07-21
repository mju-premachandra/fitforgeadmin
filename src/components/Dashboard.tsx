import { useCallback, useEffect, useState } from 'react'
import { getDashboardStats } from '../utils/dashboardStorage'
import type { DashboardStats } from '../types/dashboard'
import { ApiError } from '../lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setStats(await getDashboardStats())
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="h-8 w-8 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-6 text-center">
        <p className="text-sm text-red-400">{error ?? 'No stats available'}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
        >
          Retry
        </button>
      </div>
    )
  }

  const totalWorkouts = stats.workoutsByUser.reduce(
    (sum, row) => sum + row.workoutsCompleted,
    0,
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">Overview of users, coaches, and workouts</p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg bg-muted/60 px-3 py-1.5 text-xs font-medium text-fg-secondary hover:bg-muted"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Normal Users" value={stats.totalNormalUsers} />
        <StatCard label="Coaches" value={stats.totalCoaches} />
        <StatCard label="Workouts Completed" value={totalWorkouts} />
      </div>

      <div className="rounded-2xl border border-card-border bg-card overflow-hidden">
        <div className="border-b border-card-border px-5 py-4">
          <h2 className="text-base font-semibold text-fg">Workouts by User</h2>
          <p className="mt-0.5 text-sm text-fg-muted">
            Completed workout sessions for each normal user
          </p>
        </div>

        {stats.workoutsByUser.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-fg-muted">
            No normal users yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-card-border bg-muted/30 text-xs uppercase tracking-wider text-fg-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold text-right">Workouts</th>
                </tr>
              </thead>
              <tbody>
                {stats.workoutsByUser.map((row) => (
                  <tr
                    key={row.userId}
                    className="border-b border-card-border/60 last:border-0 hover:bg-hover/30"
                  >
                    <td className="px-5 py-3 font-medium text-fg">{row.name}</td>
                    <td className="px-5 py-3 text-fg-muted">{row.email}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-fg">
                      {row.workoutsCompleted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-fg">{value}</p>
    </div>
  )
}
