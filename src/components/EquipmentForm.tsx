import { useState } from 'react'
import FileUpload from './FileUpload'
import { api, ApiError } from '../lib/api'
import { saveEquipment } from '../utils/equipmentStorage'
import {
  EQUIPMENT_CATEGORIES,
  type Equipment,
  type EquipmentFormData,
} from '../types/equipment'

type FormErrors = Partial<Record<keyof EquipmentFormData | 'image' | 'submit', string>>

interface EquipmentFormProps {
  equipment?: Equipment
  onSaved?: () => void
  onCancel?: () => void
}

function buildInitialState(equipment?: Equipment): {
  form: EquipmentFormData
  preview: string | null
} {
  if (!equipment) {
    return {
      form: {
        name: '',
        category: EQUIPMENT_CATEGORIES[0],
        image: null,
        description: '',
      },
      preview: null,
    }
  }

  return {
    form: {
      name: equipment.name,
      category: equipment.category,
      image: null,
      description: equipment.description ?? '',
    },
    preview: equipment.imageUrl || null,
  }
}

export default function EquipmentForm({
  equipment,
  onSaved,
  onCancel,
}: EquipmentFormProps) {
  const isEdit = Boolean(equipment)
  const initial = buildInitialState(equipment)
  const [form, setForm] = useState<EquipmentFormData>(initial.form)
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
    if (!form.name.trim()) next.name = 'Equipment name is required'
    if (!form.category.trim()) next.category = 'Category is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function resolveImageUrl(): Promise<string> {
    if (form.image) {
      const { url } = await api.uploadMedia(form.image, 'equipment-image')
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
      const saved: Equipment = {
        id: isEdit ? equipment!.id : crypto.randomUUID(),
        slug: isEdit ? equipment!.slug : '',
        name: form.name.trim(),
        category: form.category.trim(),
        imageUrl,
        description: form.description.trim() || null,
        createdAt: isEdit ? equipment!.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await saveEquipment(saved)

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
          : `Failed to ${isEdit ? 'update' : 'save'} equipment. Please try again.`
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
        <h2 className="mb-6 text-lg font-semibold text-fg">Equipment Details</h2>

        <div className="space-y-5">
          <div>
            <label htmlFor="equipment-name" className="block text-sm font-medium text-fg-secondary">
              Name
            </label>
            <input
              id="equipment-name"
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }))
                setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              placeholder="e.g. Dumbbells"
              className={inputClass(Boolean(errors.name))}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="equipment-category" className="block text-sm font-medium text-fg-secondary">
              Category
            </label>
            <select
              id="equipment-category"
              value={form.category}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, category: e.target.value }))
                setErrors((prev) => ({ ...prev, category: undefined }))
              }}
              className={inputClass(Boolean(errors.category))}
            >
              {EQUIPMENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              {form.category &&
                !(EQUIPMENT_CATEGORIES as readonly string[]).includes(form.category) && (
                  <option value={form.category}>{form.category}</option>
                )}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-400">{errors.category}</p>
            )}
          </div>

          <div>
            <label htmlFor="equipment-description" className="block text-sm font-medium text-fg-secondary">
              Description <span className="font-normal text-fg-subtle">(optional)</span>
            </label>
            <textarea
              id="equipment-description"
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Short notes about this equipment..."
              className={`${inputClass(false)} resize-y`}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-card-border bg-card p-6 backdrop-blur">
        <h2 className="mb-2 text-lg font-semibold text-fg">
          Picture <span className="font-normal text-fg-subtle">(optional)</span>
        </h2>
        <p className="mb-6 text-sm text-fg-muted">
          Upload a clear photo of the equipment.
        </p>

        <FileUpload
          label="Equipment Image"
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
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Equipment'}
        </button>
      </div>
    </form>
  )
}
