import { useState } from 'react'
import EquipmentCard from './EquipmentCard'
import EquipmentForm from './EquipmentForm'
import type { Equipment } from '../types/equipment'

interface EquipmentListProps {
  equipment: Equipment[]
  onRefresh?: () => void
  onUpdated?: () => void
}

export default function EquipmentList({
  equipment,
  onRefresh,
  onUpdated,
}: EquipmentListProps) {
  const [editing, setEditing] = useState<Equipment | null>(null)

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
          <h2 className="text-lg font-semibold text-fg">Edit Equipment</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Update details for &ldquo;{editing.name}&rdquo;
          </p>
        </div>

        <EquipmentForm
          equipment={editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      </div>
    )
  }

  if (equipment.length === 0) {
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
              d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
            />
          </svg>
        </div>
        <h3 className="text-base font-medium text-fg-secondary">No equipment yet</h3>
        <p className="mt-1 max-w-xs text-sm text-fg-subtle">
          Add your first piece of equipment using the form. It will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-fg-muted">
        {equipment.length} item{equipment.length !== 1 ? 's' : ''} in library
      </p>
      <div className="grid gap-4">
        {equipment.map((item) => (
          <EquipmentCard
            key={item.id}
            equipment={item}
            onEdit={setEditing}
            onDeleted={onRefresh}
          />
        ))}
      </div>
    </div>
  )
}
