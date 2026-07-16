import { useState } from 'react'
import { deleteMuscle } from '../utils/muscleStorage'
import type { Muscle } from '../types/muscle'
import { ApiError } from '../lib/api'

interface MuscleCardProps {
  muscle: Muscle
  onEdit?: (muscle: Muscle) => void
  onDeleted?: () => void
}

export default function MuscleCard({ muscle, onEdit, onDeleted }: MuscleCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirm(`Delete "${muscle.name}"?`)) return
    setDeleting(true)
    setError(null)
    try {
      await deleteMuscle(muscle.id)
      onDeleted?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete muscle')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-card-border bg-card backdrop-blur transition hover:border-border-strong">
      <div className="flex gap-4 p-5">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
          {muscle.imageUrl ? (
            <img
              src={muscle.imageUrl}
              alt={muscle.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-fg-subtle">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-fg">{muscle.name}</h3>
              <p className="mt-1 text-xs text-fg-muted">
                Added {new Date(muscle.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onEdit?.(muscle)}
                className="rounded-lg bg-brand-600/15 px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-600/25"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="rounded-lg bg-muted/60 px-3 py-1.5 text-xs font-medium text-fg-secondary hover:bg-muted"
              >
                {expanded ? 'Collapse' : 'View'}
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
              >
                {deleting ? '...' : 'Delete'}
              </button>
            </div>
          </div>

          {!expanded && muscle.description && (
            <p className="mt-3 line-clamp-2 text-sm text-fg-muted">{muscle.description}</p>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-card-border p-5">
          {muscle.description && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-fg-muted">
                Description
              </h4>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-secondary">
                {muscle.description}
              </p>
            </div>
          )}

          {muscle.imageUrl && (
            <img
              src={muscle.imageUrl}
              alt={muscle.name}
              className="mx-auto max-h-80 rounded-xl object-contain"
            />
          )}
        </div>
      )}
    </article>
  )
}
