import { useState } from 'react'

import FileUpload from './FileUpload'

import { api } from '../lib/api'
import type { MediaUploadKind } from '../lib/blob-config'
import { saveExercise } from '../utils/exerciseStorage'

import type { Exercise, ExerciseFormData, MediaField, MediaPreviews } from '../types/exercise'



const emptyPreviews: MediaPreviews = {

  frontMuscleImage: null,

  backMuscleImage: null,

  video: null,

}



type FormErrors = Partial<Record<keyof ExerciseFormData | 'submit', string>>



interface ExerciseFormProps {

  exercise?: Exercise

  onSaved?: () => void

  onCancel?: () => void

}



function buildInitialState(exercise?: Exercise): { form: ExerciseFormData; previews: MediaPreviews } {

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



export default function ExerciseForm({ exercise, onSaved, onCancel }: ExerciseFormProps) {

  const isEdit = Boolean(exercise)

  const [form, setForm] = useState<ExerciseFormData>(() => buildInitialState(exercise).form)

  const [previews, setPreviews] = useState<MediaPreviews>(() => buildInitialState(exercise).previews)

  const [errors, setErrors] = useState<FormErrors>({})

  const [saving, setSaving] = useState(false)



  function handleFileSelect(field: MediaField, file: File) {

    const maxSize =
      field === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024

    if (file.size > maxSize) {

      setErrors((prev) => ({

        ...prev,

        [field]:
          field === 'video'
            ? 'File too large (max 50MB)'
            : 'File too large (max 10MB)',

      }))

      return

    }



    if (previews[field]?.startsWith('blob:')) {

      URL.revokeObjectURL(previews[field]!)

    }



    setForm((prev) => ({ ...prev, [field]: file }))

    setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }))

    setErrors((prev) => ({ ...prev, [field]: undefined }))

  }



  function handleClear(field: MediaField) {

    if (previews[field]?.startsWith('blob:')) {

      URL.revokeObjectURL(previews[field]!)

    }

    setForm((prev) => ({ ...prev, [field]: null }))

    setPreviews((prev) => ({ ...prev, [field]: null }))

    setErrors((prev) => ({ ...prev, [field]: undefined }))

  }



  function validate() {

    const next: FormErrors = {}

    if (!form.name.trim()) next.name = 'Exercise name is required'

    if (!form.instructions.trim()) next.instructions = 'Instructions are required'

    if (!previews.frontMuscleImage) next.frontMuscleImage = 'Front muscle diagram is required'

    if (!previews.backMuscleImage) next.backMuscleImage = 'Back muscle diagram is required'

    if (!previews.video) next.video = 'Demonstration video is required'

    setErrors(next)

    return Object.keys(next).length === 0

  }



  async function resolveMedia(
    field: MediaField,
    kind: MediaUploadKind,
  ): Promise<string> {
    if (form[field]) {
      const { url } = await api.uploadMedia(form[field]!, kind)
      return url
    }

    return previews[field]!
  }



  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault()

    if (!validate()) return



    setSaving(true)

    try {

      const saved: Exercise = {

        id: isEdit ? exercise!.id : crypto.randomUUID(),

        name: form.name.trim(),

        instructions: form.instructions.trim(),

        frontMuscleImage: await resolveMedia('frontMuscleImage', 'image'),

        backMuscleImage: await resolveMedia('backMuscleImage', 'image'),

        video: await resolveMedia('video', 'video'),

        createdAt: isEdit ? exercise!.createdAt : new Date().toISOString(),

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



  const inputClass = (hasError: boolean) =>

    `mt-1.5 w-full rounded-xl border bg-input px-4 py-2.5 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${

      hasError ? 'border-red-500' : 'border-input-border'

    }`



  return (

    <form onSubmit={handleSubmit} className="space-y-8">

      <div className="rounded-2xl border border-card-border bg-card p-6 backdrop-blur">

        <h2 className="mb-6 text-lg font-semibold text-fg">Exercise Details</h2>



        <div className="space-y-5">

          <div>

            <label htmlFor="name" className="block text-sm font-medium text-fg-secondary">

              Exercise Name

            </label>

            <input

              id="name"

              type="text"

              value={form.name}

              onChange={(e) => {

                setForm((prev) => ({ ...prev, name: e.target.value }))

                setErrors((prev) => ({ ...prev, name: undefined }))

              }}

              placeholder="e.g. Barbell Bench Press"

              className={inputClass(Boolean(errors.name))}

            />

            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}

          </div>



          <div>

            <label htmlFor="instructions" className="block text-sm font-medium text-fg-secondary">

              Instructions

            </label>

            <textarea

              id="instructions"

              rows={5}

              value={form.instructions}

              onChange={(e) => {

                setForm((prev) => ({ ...prev, instructions: e.target.value }))

                setErrors((prev) => ({ ...prev, instructions: undefined }))

              }}

              placeholder="Step-by-step instructions for performing the exercise..."

              className={`${inputClass(Boolean(errors.instructions))} resize-y`}

            />

            {errors.instructions && (

              <p className="mt-1 text-xs text-red-400">{errors.instructions}</p>

            )}

          </div>

        </div>

      </div>



      <div className="rounded-2xl border border-card-border bg-card p-6 backdrop-blur">

        <h2 className="mb-2 text-lg font-semibold text-fg">Muscle Diagrams</h2>

        <p className="mb-6 text-sm text-fg-muted">

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



      <div className="rounded-2xl border border-card-border bg-card p-6 backdrop-blur">

        <h2 className="mb-2 text-lg font-semibold text-fg">Demonstration Video</h2>

        <p className="mb-6 text-sm text-fg-muted">

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


