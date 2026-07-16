import { useState } from 'react'
import FileUpload from './FileUpload'
import { api, ApiError } from '../lib/api'
import { saveMuscle } from '../utils/muscleStorage'
import type { Muscle, MuscleFormData } from '../types/muscle'

type FormErrors = Partial<Record<keyof MuscleFormData | 'image' | 'submit', string>>

interface MuscleFormProps {
  muscle?: Muscle
  onSaved?: () => void
  onCancel?: () => void
}

function buildInitialState(muscle?: Muscle): {
  form: MuscleFormData
  preview: string | null
} {
  if (!muscle) {
    return {
      form: { name: '', description: '', image: null },
      preview: null,
    }
  }

  return {
    form: {
      name: muscle.name,
      description: muscle.description ?? '',
      image: null,
    },
    preview: muscle.imageUrl || null,
  }
}

export default function MuscleForm({ muscle, onSaved, onCancel }: MuscleFormProps) {
  const isEdit = Boolean(muscle)
  const initial = buildInitialState(muscle)
  const [form, setForm] = useState<MuscleFormData>(initial.form)
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
    if (!form.name.trim()) next.name = 'Muscle name is required'
    if (!preview) next.image = 'Picture is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function resolveImageUrl(): Promise<string> {
    if (form.image) {
      const { url } = await api.uploadMedia(form.image, 'muscle-image')
      return url
    }
    return preview!
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const imageUrl = await resolveImageUrl()
      const saved: Muscle = {
        id: isEdit ? muscle!.id : crypto.randomUUID(),
        slug: isEdit ? muscle!.slug : '',
        name: form.name.trim(),
        description: form.description.trim() || null,
        imageUrl,
        createdAt: isEdit ? muscle!.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await saveMuscle(saved)

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
          : `Failed to ${isEdit ? 'update' : 'save'} muscle. Please try again.`
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
        <h2 className="mb-6 text-lg font-semibold text-fg">Muscle Details</h2>

        <div className="space-y-5">
          <div>
            <label htmlFor="muscle-name" className="block text-sm font-medium text-fg-secondary">
              Name
            </label>
            <input
              id="muscle-name"
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }))
                setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              placeholder="e.g. Chest"
              className={inputClass(Boolean(errors.name))}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label
              htmlFor="muscle-description"
              className="block text-sm font-medium text-fg-secondary"
            >
              Description <span className="font-normal text-fg-subtle">(optional)</span>
            </label>
            <textarea
              id="muscle-description"
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Notes about this muscle group..."
              className={`${inputClass(false)} resize-y`}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-6 backdrop-blur">
        <h2 className="mb-2 text-lg font-semibold text-fg">Picture</h2>
        <p className="mb-6 text-sm text-fg-muted">
          Upload a diagram or reference image for this muscle.
        </p>

        <FileUpload
          label="Muscle Image"
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
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Muscle'}
        </button>
      </div>
    </form>
  )
}
