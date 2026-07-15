import { useState } from 'react'
import TrainerCard from './TrainerCard'
import TrainerForm from './TrainerForm'
import type { Trainer } from '../types/trainer'

interface TrainerListProps {
  trainers: Trainer[]
  onRefresh?: () => void
  onUpdated?: () => void
}

export default function TrainerList({
  trainers,
  onRefresh,
  onUpdated,
}: TrainerListProps) {
  const [editing, setEditing] = useState<Trainer | null>(null)

  function handleSaved() {
    setEditing(null)
    onRefresh?.()
    onUpdated?.()
  }

  if (editing) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted transition hover:text-fg"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to library
        </button>

        <div>
          <h2 className="text-lg font-semibold text-fg">Edit Trainer</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Update details for &ldquo;{editing.name}&rdquo;
          </p>
        </div>

        <TrainerForm
          trainer={editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      </div>
    )
  }

  if (trainers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <svg
            className="h-7 w-7 text-fg-subtle"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </div>
        <h3 className="text-base font-medium text-fg-secondary">No trainers yet</h3>
        <p className="mt-1 max-w-xs text-sm text-fg-subtle">
          Add your first trainer using the form. They will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-fg-muted">
        {trainers.length} trainer{trainers.length !== 1 ? 's' : ''} in library
      </p>
      <div className="grid gap-4">
        {trainers.map((trainer) => (
          <TrainerCard
            key={trainer.id}
            trainer={trainer}
            onEdit={setEditing}
            onDeleted={onRefresh}
          />
        ))}
      </div>
    </div>
  )
}
