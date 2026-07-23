import { useCallback, useEffect, useState } from 'react'
import ChallengeForm from './ChallengeForm'
import { ApiError } from '../lib/api'
import {
  challengeTypeLabel,
  type Challenge,
  type ChallengeParticipant,
} from '../types/challenge'
import {
  deleteChallenge,
  getChallengeParticipants,
  getChallenges,
} from '../utils/challengeStorage'

interface ChallengeListProps {
  onUpdated?: () => void
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString()
}

export default function ChallengeList({ onUpdated }: ChallengeListProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [scope, setScope] = useState<'all' | 'official' | 'user'>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Challenge | null>(null)
  const [participantsFor, setParticipantsFor] = useState<Challenge | null>(null)
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setChallenges(
        await getChallenges({
          scope,
          search: search || undefined,
        }),
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load challenges')
    } finally {
      setLoading(false)
    }
  }, [scope, search])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === search) return
      setSearch(next)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput, search])

  async function openParticipants(challenge: Challenge) {
    setParticipantsFor(challenge)
    setLoadingParticipants(true)
    setError(null)
    try {
      setParticipants(await getChallengeParticipants(challenge.id))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load participants')
      setParticipantsFor(null)
    } finally {
      setLoadingParticipants(false)
    }
  }

  async function handleDelete(challenge: Challenge) {
    const kind = challenge.isOfficial ? 'official challenge' : 'user-created challenge'
    if (!confirm(`Remove this ${kind}: "${challenge.title}"?`)) return
    try {
      await deleteChallenge(challenge.id)
      if (participantsFor?.id === challenge.id) {
        setParticipantsFor(null)
        setParticipants([])
      }
      await load()
      onUpdated?.()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete challenge')
    }
  }

  function handleSaved() {
    setEditing(null)
    void load()
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
          Back to challenges
        </button>
        <div>
          <h2 className="text-lg font-semibold text-fg">Edit Challenge</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Update dates, target, and details for &ldquo;{editing.title}&rdquo;
          </p>
        </div>
        <ChallengeForm
          challenge={editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      </div>
    )
  }

  if (participantsFor) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => {
            setParticipantsFor(null)
            setParticipants([])
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-fg-muted transition hover:text-fg"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to challenges
        </button>

        <div>
          <h2 className="text-lg font-semibold text-fg">Participants</h2>
          <p className="mt-1 text-sm text-fg-muted">
            {participantsFor.title} · target {participantsFor.target}
          </p>
        </div>

        {loadingParticipants ? (
          <div className="flex justify-center py-16">
            <svg className="h-8 w-8 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : participants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-fg-muted">
            No participants yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-card-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-card-border bg-muted/30 text-xs uppercase tracking-wider text-fg-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">User</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold text-right">Progress</th>
                  <th className="px-5 py-3 font-semibold text-right">Joined</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((row) => (
                  <tr key={row.id} className="border-b border-card-border/60 last:border-0">
                    <td className="px-5 py-3 font-medium text-fg">{row.name}</td>
                    <td className="px-5 py-3 text-fg-muted">{row.email}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-fg">
                      {row.progress}
                      <span className="text-fg-muted"> / {participantsFor.target}</span>
                    </td>
                    <td className="px-5 py-3 text-right text-fg-muted">
                      {formatDate(row.joinedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
            placeholder="Search challenges..."
            className="w-full rounded-xl border border-input-border bg-input py-2.5 pl-10 pr-4 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as 'all' | 'official' | 'user')}
          className="rounded-xl border border-input-border bg-input px-4 py-2.5 text-sm text-fg"
        >
          <option value="all">All challenges</option>
          <option value="official">Official only</option>
          <option value="user">User-created only</option>
        </select>
      </div>

      <p className="text-sm text-fg-muted">
        {challenges.length} challenge{challenges.length !== 1 ? 's' : ''}
      </p>

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="h-8 w-8 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : challenges.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <h3 className="text-base font-medium text-fg-secondary">No challenges found</h3>
          <p className="mt-1 text-sm text-fg-subtle">
            Create an official challenge or adjust your filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {challenges.map((challenge) => (
            <article
              key={challenge.id}
              className="rounded-2xl border border-card-border bg-card p-5 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-fg">{challenge.title}</h3>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs ${
                        challenge.isOfficial
                          ? 'bg-brand-600/15 text-brand-500'
                          : 'bg-muted text-fg-secondary'
                      }`}
                    >
                      {challenge.isOfficial ? 'Official' : 'User-created'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-fg-muted">
                    {challengeTypeLabel(challenge.challengeType)} · Target {challenge.target} ·{' '}
                    {challenge.participantCount} participant
                    {challenge.participantCount !== 1 ? 's' : ''}
                  </p>
                  <p className="mt-1 text-xs text-fg-subtle">
                    {formatDate(challenge.startDate)} → {formatDate(challenge.endDate)} · by{' '}
                    {challenge.creator.name}
                  </p>
                  {challenge.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-fg-muted">
                      {challenge.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(challenge)}
                    className="rounded-lg bg-brand-600/15 px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-600/25"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void openParticipants(challenge)}
                    className="rounded-lg bg-muted/60 px-3 py-1.5 text-xs font-medium text-fg-secondary hover:bg-muted"
                  >
                    Participants
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(challenge)}
                    className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
