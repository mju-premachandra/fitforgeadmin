import { useState } from 'react'
import { deleteTrainer } from '../utils/trainerStorage'
import type { Trainer } from '../types/trainer'
import { ApiError } from '../lib/api'

interface TrainerCardProps {
  trainer: Trainer
  onEdit?: (trainer: Trainer) => void
  onDeleted?: () => void
}

export default function TrainerCard({
  trainer,
  onEdit,
  onDeleted,
}: TrainerCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirm(`Delete "${trainer.name}"?`)) return
    setDeleting(true)
    setError(null)
    try {
      await deleteTrainer(trainer.id)
      onDeleted?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete trainer')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-card-border bg-card backdrop-blur transition hover:border-border-strong">
      <div className="flex gap-4 p-5">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
          {trainer.imageUrl ? (
            <img
              src={trainer.imageUrl}
              alt={trainer.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-fg-subtle">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-fg">{trainer.name}</h3>
              <p className="mt-1 text-xs text-fg-muted">
                <span className="rounded-md bg-muted px-2 py-0.5 text-fg-secondary">
                  {trainer.specialty}
                </span>
                <span className="ml-2">
                  {trainer.experienceYears} year
                  {trainer.experienceYears === 1 ? '' : 's'} experience
                </span>
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onEdit?.(trainer)}
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
          {!expanded && trainer.description && (
            <p className="mt-3 line-clamp-2 text-sm text-fg-muted">{trainer.description}</p>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-card-border p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-fg-muted">
                Specialty
              </h4>
              <p className="text-sm text-fg-secondary">{trainer.specialty}</p>
            </div>
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-fg-muted">
                Experience
              </h4>
              <p className="text-sm text-fg-secondary">
                {trainer.experienceYears} year{trainer.experienceYears === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {trainer.description && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-fg-muted">
                Description
              </h4>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-secondary">
                {trainer.description}
              </p>
            </div>
          )}

          {trainer.imageUrl && (
            <img
              src={trainer.imageUrl}
              alt={trainer.name}
              className="mx-auto max-h-80 rounded-xl object-contain"
            />
          )}
        </div>
      )}
    </article>
  )
}
