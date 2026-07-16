import { useEffect, useState } from 'react'
import { updateUser } from '../utils/userStorage'
import type { ManagedUser, UserRole } from '../types/user'
import { ApiError } from '../lib/api'

interface UserCardProps {
  user: ManagedUser
  onRefresh?: () => void
}

export default function UserCard({ user, onRefresh }: UserCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [role, setRole] = useState<UserRole>(user.role)
  const [banReason, setBanReason] = useState(user.banReason ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setRole(user.role)
    setBanReason(user.banReason ?? '')
  }, [user])

  async function handleRoleChange(nextRole: UserRole) {
    setRole(nextRole)
    setSaving(true)
    setError(null)
    try {
      await updateUser(user.id, { role: nextRole })
      onRefresh?.()
    } catch (err) {
      setRole(user.role)
      setError(err instanceof ApiError ? err.message : 'Failed to update role')
    } finally {
      setSaving(false)
    }
  }

  async function handleBanToggle() {
    const nextBanned = !user.banned
    if (nextBanned && !confirm(`Ban "${user.name}"?`)) return

    setSaving(true)
    setError(null)
    try {
      await updateUser(user.id, {
        banned: nextBanned,
        banReason: nextBanned ? banReason.trim() || 'Banned by admin' : null,
      })
      onRefresh?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update ban status')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveBanReason() {
    if (!user.banned) return
    setSaving(true)
    setError(null)
    try {
      await updateUser(user.id, { banReason: banReason.trim() || null })
      onRefresh?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update ban reason')
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-card-border bg-card backdrop-blur transition hover:border-border-strong">
      <div className="flex gap-4 p-5">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-brand-600/15">
          {user.image ? (
            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold uppercase text-brand-500">
              {user.name.slice(0, 2)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-fg">{user.name}</h3>
              <p className="mt-0.5 truncate text-sm text-fg-muted">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs capitalize text-fg-secondary">
                  {user.role}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs ${
                    user.emailVerified
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {user.emailVerified ? 'Verified' : 'Unverified'}
                </span>
                {user.banned && (
                  <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                    Banned
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="shrink-0 rounded-lg bg-muted/60 px-3 py-1.5 text-xs font-medium text-fg-secondary hover:bg-muted"
            >
              {expanded ? 'Collapse' : 'Manage'}
            </button>
          </div>

          <p className="mt-2 text-xs text-fg-subtle">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-card-border p-5">
          <div>
            <label htmlFor={`role-${user.id}`} className="block text-sm font-medium text-fg-secondary">
              Role
            </label>
            <select
              id={`role-${user.id}`}
              value={role}
              disabled={saving}
              onChange={(e) => void handleRoleChange(e.target.value as UserRole)}
              className="mt-1.5 w-full rounded-xl border border-input-border bg-input px-4 py-2.5 text-sm text-fg"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-input-border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-fg">Account status</p>
              <p className="text-xs text-fg-muted">
                {user.banned ? 'This user is currently banned' : 'This user can sign in'}
              </p>
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleBanToggle()}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                user.banned
                  ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              } disabled:opacity-50`}
            >
              {user.banned ? 'Unban' : 'Ban'}
            </button>
          </div>

          {user.banned && (
            <div>
              <label htmlFor={`ban-${user.id}`} className="block text-sm font-medium text-fg-secondary">
                Ban reason
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id={`ban-${user.id}`}
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Reason for ban"
                  className="flex-1 rounded-xl border border-input-border bg-input px-4 py-2.5 text-sm text-fg"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleSaveBanReason()}
                  className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
