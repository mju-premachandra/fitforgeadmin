import { useEffect, useState } from 'react'
import { deleteAdmin, getAllAdmins, saveAdmin } from '../utils/adminStorage'
import type { Admin, AdminFormData, AdminRole } from '../types/admin'

interface AdminManagerProps {
  onNotify?: (message: string) => void
}

type FormErrors = Partial<Record<keyof AdminFormData | 'submit', string>>

const emptyForm: AdminFormData = {
  name: '',
  email: '',
  role: 'admin',
  password: '',
  confirmPassword: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const roleLabels: Record<AdminRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  trainer: 'Trainer',
}

export default function AdminManager({ onNotify }: AdminManagerProps) {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<AdminFormData>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const data = await getAllAdmins()
        if (!cancelled) setAdmins(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  function updateField<K extends keyof AdminFormData>(field: K, value: AdminFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validate(): boolean {
    const next: FormErrors = {}
    const email = form.email.trim().toLowerCase()

    if (!form.name.trim()) next.name = 'Name is required'
    if (!email) {
      next.email = 'Email is required'
    } else if (!emailPattern.test(email)) {
      next.email = 'Enter a valid email address'
    } else if (admins.some((a) => a.email.toLowerCase() === email)) {
      next.email = 'An admin with this email already exists'
    }
    if (!form.password) {
      next.password = 'Password is required'
    } else if (form.password.length < 8) {
      next.password = 'Password must be at least 8 characters'
    }
    if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Passwords do not match'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const created = await saveAdmin({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      })
      setAdmins((prev) => [...prev, created])
      setForm(emptyForm)
      setErrors({})
      onNotify?.('Admin added successfully!')
    } catch {
      setErrors({ submit: 'Failed to add admin. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(admin: Admin) {
    const owners = admins.filter((a) => a.role === 'owner')
    if (admin.role === 'owner' && owners.length === 1) {
      onNotify?.('Cannot remove the last owner.')
      return
    }
    if (!confirm(`Remove admin "${admin.name}"?`)) return

    setDeletingId(admin.id)
    try {
      await deleteAdmin(admin.id)
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id))
      onNotify?.('Admin removed.')
    } finally {
      setDeletingId(null)
    }
  }

  const inputClass = (hasError: boolean) =>
    `mt-1.5 w-full rounded-xl border bg-input px-4 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
      hasError ? 'border-red-500' : 'border-input-border'
    }`

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <form onSubmit={handleSubmit} className="lg:col-span-2">
        <div className="rounded-2xl border border-card-border bg-card p-6 backdrop-blur">
          <h2 className="mb-1 text-lg font-semibold text-fg">Add Admin</h2>
          <p className="mb-6 text-sm text-fg-muted">
            Create a new admin account with access to this panel.
          </p>

          <div className="space-y-5">
            <div>
              <label htmlFor="admin-name" className="block text-sm font-medium text-fg-secondary">
                Full Name
              </label>
              <input
                id="admin-name"
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Jane Doe"
                className={inputClass(Boolean(errors.name))}
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-fg-secondary">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="jane@example.com"
                className={inputClass(Boolean(errors.email))}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="admin-role" className="block text-sm font-medium text-fg-secondary">
                Role
              </label>
              <select
                id="admin-role"
                value={form.role}
                onChange={(e) => updateField('role', e.target.value as AdminRole)}
                className={inputClass(false)}
              >
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
                <option value="trainer">Trainer</option>
              </select>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-fg-secondary">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="At least 8 characters"
                className={inputClass(Boolean(errors.password))}
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            <div>
              <label
                htmlFor="admin-confirm"
                className="block text-sm font-medium text-fg-secondary"
              >
                Confirm Password
              </label>
              <input
                id="admin-confirm"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                className={inputClass(Boolean(errors.confirmPassword))}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errors.submit}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding...
              </>
            ) : (
              'Add Admin'
            )}
          </button>
        </div>
      </form>

      <div className="lg:col-span-3">
        <div className="rounded-2xl border border-card-border bg-card p-6 backdrop-blur">
          <h2 className="mb-1 text-lg font-semibold text-fg">Admins</h2>
          <p className="mb-6 text-sm text-fg-muted">
            {admins.length} admin{admins.length !== 1 ? 's' : ''} with access to this panel
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="h-7 w-7 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : admins.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <svg className="h-6 w-6 text-fg-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-medium text-fg-secondary">No admins yet</h3>
              <p className="mt-1 max-w-xs text-sm text-fg-subtle">
                Add your first admin using the form to grant access.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {admins.map((admin) => (
                <li
                  key={admin.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-card-border bg-surface-800/40 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600/15 text-sm font-semibold uppercase text-brand-500">
                      {admin.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-fg">{admin.name}</p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            admin.role === 'owner'
                              ? 'bg-brand-600/15 text-brand-500'
                              : 'bg-muted text-fg-secondary'
                          }`}
                        >
                          {roleLabels[admin.role]}
                        </span>
                      </div>
                      <p className="truncate text-xs text-fg-muted">{admin.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(admin)}
                    disabled={deletingId === admin.id}
                    className="shrink-0 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {deletingId === admin.id ? '...' : 'Remove'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
