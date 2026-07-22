import { useCallback, useEffect, useState } from 'react'
import TrainerCard from './TrainerCard'
import TrainerForm from './TrainerForm'
import { TRAINER_SPECIALTIES, type Trainer } from '../types/trainer'
import { getTrainers } from '../utils/trainerStorage'
import { ApiError } from '../lib/api'

const PAGE_SIZE = 10

interface TrainerListProps {
  onRefresh?: () => void
  onUpdated?: () => void
}

export default function TrainerList({ onRefresh, onUpdated }: TrainerListProps) {
  const [editing, setEditing] = useState<Trainer | null>(null)
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getTrainers({
        search: search || undefined,
        specialty: specialty || undefined,
        page,
        limit: PAGE_SIZE,
      })
      setTrainers(result.items)
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setSpecialties(result.specialties)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load trainers')
    } finally {
      setLoading(false)
    }
  }, [search, specialty, page])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === search) return
      setPage(1)
      setSearch(next)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput, search])

  function handleSaved() {
    setEditing(null)
    void load()
    onRefresh?.()
    onUpdated?.()
  }

  function handleDeleted() {
    void load()
    onRefresh?.()
  }

  const specialtyOptions = Array.from(
    new Set([...TRAINER_SPECIALTIES, ...specialties]),
  ).sort((a, b) => a.localeCompare(b))

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

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, specialty, or description..."
            className="w-full rounded-xl border border-input-border bg-input py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>

        <select
          value={specialty}
          onChange={(e) => {
            setPage(1)
            setSpecialty(e.target.value)
          }}
          className="rounded-xl border border-input-border bg-input px-4 py-2.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-brand-500/50"
        >
          <option value="">All specialties</option>
          {specialtyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">
          {total} trainer{total !== 1 ? 's' : ''}
          {(search || specialty) && ' matching filters'}
        </p>
        {(search || specialty) && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('')
              setSearch('')
              setSpecialty('')
              setPage(1)
            }}
            className="text-xs font-medium text-brand-500 hover:text-brand-400"
          >
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="h-8 w-8 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      ) : trainers.length === 0 ? (
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
          <h3 className="text-base font-medium text-fg-secondary">
            {search || specialty ? 'No trainers found' : 'No trainers yet'}
          </h3>
          <p className="mt-1 max-w-xs text-sm text-fg-subtle">
            {search || specialty
              ? 'Try a different search or specialty filter.'
              : 'Add your first trainer using the form. They will appear here.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {trainers.map((trainer) => (
              <TrainerCard
                key={trainer.id}
                trainer={trainer}
                onEdit={setEditing}
                onDeleted={handleDeleted}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <p className="text-xs text-fg-muted">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-input-border px-3 py-1.5 text-xs font-medium text-fg-secondary hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-input-border px-3 py-1.5 text-xs font-medium text-fg-secondary hover:bg-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
