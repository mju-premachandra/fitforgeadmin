import { useState } from 'react'
import FileUpload from './FileUpload'
import { fileToDataUrl, saveExercise } from '../utils/exerciseStorage'

const emptyPreviews = {
  frontMuscleImage: null,
  backMuscleImage: null,
  video: null,
}

function buildInitialState(exercise) {
  if (!exercise) {
    return {
      form: {
        name: '',
        instructions: '',
        frontMuscleImage: null,
        backMuscleImage: null,
        video: null,
      },
      previews: { ...emptyPreviews },
    }
  }

  return {
    form: {
      name: exercise.name,
      instructions: exercise.instructions,
      frontMuscleImage: null,
      backMuscleImage: null,
      video: null,
    },
    previews: {
      frontMuscleImage: exercise.frontMuscleImage,
      backMuscleImage: exercise.backMuscleImage,
      video: exercise.video,
    },
  }
}

export default function ExerciseForm({ exercise, onSaved, onCancel }) {
  const isEdit = Boolean(exercise)
  const [form, setForm] = useState(() => buildInitialState(exercise).form)
  const [previews, setPreviews] = useState(() => buildInitialState(exercise).previews)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function handleFileSelect(field, file) {
    const maxSize = 10 * 1024 * 1024
    if (field !== 'video' && file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        [field]: 'File too large (max 10MB)',
      }))
      return
    }

    if (previews[field]?.startsWith('blob:')) {
      URL.revokeObjectURL(previews[field])
    }

    setForm((prev) => ({ ...prev, [field]: file }))
    setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }))
    setErrors((prev) => ({ ...prev, [field]: null }))
  }

  function handleClear(field) {
    if (previews[field]?.startsWith('blob:')) {
      URL.revokeObjectURL(previews[field])
    }
    setForm((prev) => ({ ...prev, [field]: null }))
    setPreviews((prev) => ({ ...prev, [field]: null }))
    setErrors((prev) => ({ ...prev, [field]: null }))
  }

  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Exercise name is required'
    if (!form.instructions.trim()) next.instructions = 'Instructions are required'
    if (!previews.frontMuscleImage) next.frontMuscleImage = 'Front muscle diagram is required'
    if (!previews.backMuscleImage) next.backMuscleImage = 'Back muscle diagram is required'
    if (!previews.video) next.video = 'Demonstration video is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function resolveMedia(field) {
    if (form[field]) return fileToDataUrl(form[field])
    return previews[field]
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const saved = {
        id: isEdit ? exercise.id : crypto.randomUUID(),
        name: form.name.trim(),
        instructions: form.instructions.trim(),
        frontMuscleImage: await resolveMedia('frontMuscleImage'),
        backMuscleImage: await resolveMedia('backMuscleImage'),
        video: await resolveMedia('video'),
        createdAt: isEdit ? exercise.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await saveExercise(saved)

      Object.values(previews).forEach((url) => {
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
      })

      if (!isEdit) {
        setForm(buildInitialState().form)
        setPreviews(buildInitialState().previews)
      }

      setErrors({})
      onSaved?.()
    } catch {
      setErrors({ submit: `Failed to ${isEdit ? 'update' : 'save'} exercise. Please try again.` })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur">
        <h2 className="mb-6 text-lg font-semibold text-white">Exercise Details</h2>

        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-200">
              Exercise Name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }))
                setErrors((prev) => ({ ...prev, name: null }))
              }}
              placeholder="e.g. Barbell Bench Press"
              className={`mt-1.5 w-full rounded-xl border bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
                errors.name ? 'border-red-500' : 'border-slate-600'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-slate-200">
              Instructions
            </label>
            <textarea
              id="instructions"
              rows={5}
              value={form.instructions}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, instructions: e.target.value }))
                setErrors((prev) => ({ ...prev, instructions: null }))
              }}
              placeholder="Step-by-step instructions for performing the exercise..."
              className={`mt-1.5 w-full resize-y rounded-xl border bg-slate-900/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
                errors.instructions ? 'border-red-500' : 'border-slate-600'
              }`}
            />
            {errors.instructions && (
              <p className="mt-1 text-xs text-red-400">{errors.instructions}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur">
        <h2 className="mb-2 text-lg font-semibold text-white">Muscle Diagrams</h2>
        <p className="mb-6 text-sm text-slate-400">
          Upload front and back body diagrams showing which muscles this exercise targets.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <FileUpload
            label="Front View"
            description="Muscles worked — front of body"
            accept="image/png,image/jpeg,image/webp"
            preview={previews.frontMuscleImage}
            onFileSelect={(file) => handleFileSelect('frontMuscleImage', file)}
            onClear={() => handleClear('frontMuscleImage')}
            error={errors.frontMuscleImage}
          />
          <FileUpload
            label="Back View"
            description="Muscles worked — back of body"
            accept="image/png,image/jpeg,image/webp"
            preview={previews.backMuscleImage}
            onFileSelect={(file) => handleFileSelect('backMuscleImage', file)}
            onClear={() => handleClear('backMuscleImage')}
            error={errors.backMuscleImage}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur">
        <h2 className="mb-2 text-lg font-semibold text-white">Demonstration Video</h2>
        <p className="mb-6 text-sm text-slate-400">
          Upload a video showing proper form and technique for this exercise.
        </p>

        <FileUpload
          label="Exercise Video"
          accept="video/mp4,video/webm,video/quicktime"
          preview={previews.video}
          previewType="video"
          onFileSelect={(file) => handleFileSelect('video', file)}
          onClear={() => handleClear('video')}
          error={errors.video}
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
            className="rounded-xl border border-slate-600 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Saving...
            </>
          ) : isEdit ? (
            'Save Changes'
          ) : (
            'Add Exercise'
          )}
        </button>
      </div>
    </form>
  )
}
