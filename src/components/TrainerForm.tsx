import { useState } from 'react'
import FileUpload from './FileUpload'
import { api, ApiError } from '../lib/api'
import { saveTrainer } from '../utils/trainerStorage'
import {
  TRAINER_SPECIALTIES,
  type Trainer,
  type TrainerFormData,
} from '../types/trainer'

type FormErrors = Partial<
  Record<keyof TrainerFormData | 'image' | 'submit', string>
>

interface TrainerFormProps {
  trainer?: Trainer
  onSaved?: () => void
  onCancel?: () => void
}

function buildInitialState(trainer?: Trainer): {
  form: TrainerFormData
  preview: string | null
} {
  if (!trainer) {
    return {
      form: {
        name: '',
        specialty: TRAINER_SPECIALTIES[0],
        experienceYears: '',
        description: '',
        image: null,
      },
      preview: null,
    }
  }

  return {
    form: {
      name: trainer.name,
      specialty: trainer.specialty,
      experienceYears: String(trainer.experienceYears),
      description: trainer.description ?? '',
      image: null,
    },
    preview: trainer.imageUrl || null,
  }
}

export default function TrainerForm({
  trainer,
  onSaved,
  onCancel,
}: TrainerFormProps) {
  const isEdit = Boolean(trainer)
  const initial = buildInitialState(trainer)
  const [form, setForm] = useState<TrainerFormData>(initial.form)
  const [preview, setPreview] = useState<string | null>(initial.preview)
  const [errors, setErrors] = useState<FormErrors>({})
  const [saving, setSaving] = useState(false)

  function handleFileSelect(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'File too large (max 10MB)' }))
      return
    }

    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)

    setForm((prev) => ({ ...prev, image: file }))
    setPreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, image: undefined }))
  }

  function handleClearImage() {
    if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    setForm((prev) => ({ ...prev, image: null }))
    setPreview(null)
    setErrors((prev) => ({ ...prev, image: undefined }))
  }

  function validate() {
    const next: FormErrors = {}
    if (!form.name.trim()) next.name = 'Name is required'
    if (!form.specialty.trim()) next.specialty = 'Specialty is required'

    const years = Number(form.experienceYears)
    if (form.experienceYears.trim() === '' || Number.isNaN(years)) {
      next.experienceYears = 'Experience is required'
    } else if (!Number.isInteger(years) || years < 0) {
      next.experienceYears = 'Enter a whole number of years (0 or more)'
    }

    if (!form.description.trim()) next.description = 'Description is required'
    if (!preview) next.image = 'Profile picture is required'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function resolveImageUrl(): Promise<string> {
    if (form.image) {
      const { url } = await api.uploadMedia(form.image, 'trainer-image')
      return url
    }
    return preview ?? ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const imageUrl = await resolveImageUrl()
      const saved: Trainer = {
        id: isEdit ? trainer!.id : crypto.randomUUID(),
        name: form.name.trim(),
        specialty: form.specialty.trim(),
        experienceYears: Number(form.experienceYears),
        description: form.description.trim() || null,
        imageUrl,
        createdAt: isEdit ? trainer!.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await saveTrainer(saved)

      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)

      if (!isEdit) {
        const reset = buildInitialState()
        setForm(reset.form)
        setPreview(reset.preview)
      }

      setErrors({})
      onSaved?.()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : `Failed to ${isEdit ? 'update' : 'save'} trainer. Please try again.`
      setErrors({ submit: message })
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
        <h2 className="mb-6 text-lg font-semibold text-fg">Trainer Details</h2>

        <div className="space-y-5">
          <div>
            <label htmlFor="trainer-name" className="block text-sm font-medium text-fg-secondary">
              Name
            </label>
            <input
              id="trainer-name"
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }))
                setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              placeholder="e.g. Alex Morgan"
              className={inputClass(Boolean(errors.name))}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="trainer-specialty" className="block text-sm font-medium text-fg-secondary">
              Specialty
            </label>
            <select
              id="trainer-specialty"
              value={form.specialty}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, specialty: e.target.value }))
                setErrors((prev) => ({ ...prev, specialty: undefined }))
              }}
              className={inputClass(Boolean(errors.specialty))}
            >
              {TRAINER_SPECIALTIES.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
              {form.specialty &&
                !(TRAINER_SPECIALTIES as readonly string[]).includes(form.specialty) && (
                  <option value={form.specialty}>{form.specialty}</option>
                )}
            </select>
            {errors.specialty && (
              <p className="mt-1 text-xs text-red-400">{errors.specialty}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="trainer-experience"
              className="block text-sm font-medium text-fg-secondary"
            >
              Experience (years)
            </label>
            <input
              id="trainer-experience"
              type="number"
              min={0}
              step={1}
              value={form.experienceYears}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, experienceYears: e.target.value }))
                setErrors((prev) => ({ ...prev, experienceYears: undefined }))
              }}
              placeholder="e.g. 5"
              className={inputClass(Boolean(errors.experienceYears))}
            />
            {errors.experienceYears && (
              <p className="mt-1 text-xs text-red-400">{errors.experienceYears}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="trainer-description"
              className="block text-sm font-medium text-fg-secondary"
            >
              Description
            </label>
            <textarea
              id="trainer-description"
              rows={4}
              value={form.description}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, description: e.target.value }))
                setErrors((prev) => ({ ...prev, description: undefined }))
              }}
              placeholder="Short bio or notes about this trainer..."
              className={`${inputClass(Boolean(errors.description))} resize-y`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-400">{errors.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-6 backdrop-blur">
        <h2 className="mb-2 text-lg font-semibold text-fg">Picture</h2>
        <p className="mb-6 text-sm text-fg-muted">Upload a profile photo for this trainer.</p>

        <FileUpload
          label="Trainer Photo"
          description="PNG, JPEG, or WebP — max 10MB"
          accept="image/png,image/jpeg,image/webp"
          preview={preview}
          onFileSelect={handleFileSelect}
          onClear={handleClearImage}
          error={errors.image}
        />
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
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Trainer'}
        </button>
      </div>
    </form>
  )
}
