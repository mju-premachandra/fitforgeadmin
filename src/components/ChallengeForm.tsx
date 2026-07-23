import { useState } from 'react'
import { ApiError } from '../lib/api'
import {
  CHALLENGE_TYPES,
  challengeTypeLabel,
  toDateInputValue,
  type Challenge,
  type ChallengeFormData,
  type ChallengeType,
} from '../types/challenge'
import { createChallenge, updateChallenge } from '../utils/challengeStorage'

type FormErrors = Partial<Record<keyof ChallengeFormData | 'submit', string>>

interface ChallengeFormProps {
  challenge?: Challenge
  onSaved?: () => void
  onCancel?: () => void
}

function buildInitial(challenge?: Challenge): ChallengeFormData {
  if (!challenge) {
    return {
      title: '',
      description: '',
      challengeType: 'workout_count',
      target: '10',
      startDate: '',
      endDate: '',
    }
  }
  return {
    title: challenge.title,
    description: challenge.description ?? '',
    challengeType: challenge.challengeType,
    target: String(challenge.target),
    startDate: toDateInputValue(challenge.startDate),
    endDate: toDateInputValue(challenge.endDate),
  }
}

export default function ChallengeForm({
  challenge,
  onSaved,
  onCancel,
}: ChallengeFormProps) {
  const isEdit = Boolean(challenge)
  const [form, setForm] = useState<ChallengeFormData>(() => buildInitial(challenge))
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  function validate() {
    const next: FormErrors = {}
    if (!form.title.trim()) next.title = 'Title is required'
    const target = Number(form.target)
    if (!form.target.trim() || Number.isNaN(target) || !Number.isInteger(target) || target < 1) {
      next.target = 'Target must be a whole number of 1 or more'
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      next.endDate = 'End date must be on or after start date'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        challengeType: form.challengeType as ChallengeType,
        target: Number(form.target),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      }

      if (isEdit && challenge) {
        await updateChallenge(challenge.id, {
          ...payload,
          description: form.description.trim(),
          startDate: form.startDate || null,
          endDate: form.endDate || null,
        })
      } else {
        await createChallenge(payload)
        setForm(buildInitial())
      }

      setErrors({})
      onSaved?.()
    } catch (err) {
      setErrors({
        submit:
          err instanceof ApiError
            ? err.message
            : `Failed to ${isEdit ? 'update' : 'create'} challenge.`,
      })
    } finally {
      setSaving(false)
    }
  }

  const inputClass = (hasError: boolean) =>
    `mt-1.5 w-full rounded-xl border bg-input px-4 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
      hasError ? 'border-red-500' : 'border-input-border'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-2xl border border-card-border bg-card p-6 backdrop-blur">
        <h2 className="mb-6 text-lg font-semibold text-fg">
          {isEdit ? 'Edit Challenge' : 'Official Challenge Details'}
        </h2>

        <div className="space-y-5">
          <div>
            <label htmlFor="challenge-title" className="block text-sm font-medium text-fg-secondary">
              Title
            </label>
            <input
              id="challenge-title"
              type="text"
              value={form.title}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, title: e.target.value }))
                setErrors((prev) => ({ ...prev, title: undefined }))
              }}
              placeholder="e.g. 30-Day Workout Challenge"
              className={inputClass(Boolean(errors.title))}
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
          </div>

          <div>
            <label
              htmlFor="challenge-description"
              className="block text-sm font-medium text-fg-secondary"
            >
              Description <span className="font-normal text-fg-subtle">(optional)</span>
            </label>
            <textarea
              id="challenge-description"
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="What participants need to do..."
              className={`${inputClass(false)} resize-y`}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="challenge-type"
                className="block text-sm font-medium text-fg-secondary"
              >
                Type
              </label>
              <select
                id="challenge-type"
                value={form.challengeType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    challengeType: e.target.value as ChallengeType,
                  }))
                }
                className={inputClass(false)}
              >
                {CHALLENGE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="challenge-target"
                className="block text-sm font-medium text-fg-secondary"
              >
                Target
              </label>
              <input
                id="challenge-target"
                type="number"
                min={1}
                step={1}
                value={form.target}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, target: e.target.value }))
                  setErrors((prev) => ({ ...prev, target: undefined }))
                }}
                placeholder="e.g. 20"
                className={inputClass(Boolean(errors.target))}
              />
              {errors.target && (
                <p className="mt-1 text-xs text-red-400">{errors.target}</p>
              )}
              <p className="mt-1 text-xs text-fg-subtle">
                Goal for {challengeTypeLabel(form.challengeType).toLowerCase()}
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="challenge-start"
                className="block text-sm font-medium text-fg-secondary"
              >
                Start date <span className="font-normal text-fg-subtle">(optional)</span>
              </label>
              <input
                id="challenge-start"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className={inputClass(false)}
              />
            </div>
            <div>
              <label
                htmlFor="challenge-end"
                className="block text-sm font-medium text-fg-secondary"
              >
                End date <span className="font-normal text-fg-subtle">(optional)</span>
              </label>
              <input
                id="challenge-end"
                type="date"
                value={form.endDate}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, endDate: e.target.value }))
                  setErrors((prev) => ({ ...prev, endDate: undefined }))
                }}
                className={inputClass(Boolean(errors.endDate))}
              />
              {errors.endDate && (
                <p className="mt-1 text-xs text-red-400">{errors.endDate}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {errors.submit && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {errors.submit}
        </p>
      )}

      <div className="flex justify-end gap-3">
        {isEdit && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-input-border px-6 py-2.5 text-sm font-semibold text-fg-secondary transition hover:bg-hover"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Official Challenge'}
        </button>
      </div>
    </form>
  )
}
