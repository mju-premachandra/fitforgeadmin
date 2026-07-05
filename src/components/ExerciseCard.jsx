import { useState } from 'react'
import { deleteExercise } from '../utils/exerciseStorage'

export default function ExerciseCard({ exercise, onEdit, onDeleted }) {
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState('front')

  async function handleDelete() {
    if (!confirm(`Delete "${exercise.name}"?`)) return
    setDeleting(true)
    try {
      await deleteExercise(exercise.id)
      onDeleted?.()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 backdrop-blur transition hover:border-slate-600">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">{exercise.name}</h3>
            <p className="mt-1 text-xs text-slate-400">
              Added {new Date(exercise.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => onEdit?.(exercise)}
              className="rounded-lg bg-brand-600/15 px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-600/25"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-lg bg-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
            >
              {expanded ? 'Collapse' : 'View'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
            >
              {deleting ? '...' : 'Delete'}
            </button>
          </div>
        </div>

        {!expanded && (
          <p className="mt-3 line-clamp-2 text-sm text-slate-400">
            {exercise.instructions}
          </p>
        )}
      </div>

      {expanded && (
        <div className="border-t border-slate-700/60">
          <div className="p-5 space-y-5">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Instructions
              </h4>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {exercise.instructions}
              </p>
            </div>

            <div>
              <div className="mb-3 flex gap-2">
                {['front', 'back', 'video'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                      activeTab === tab
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {tab === 'video' ? 'Video' : `${tab} muscles`}
                  </button>
                ))}
              </div>

              {activeTab === 'front' && (
                <img
                  src={exercise.frontMuscleImage}
                  alt={`${exercise.name} front muscles`}
                  className="mx-auto max-h-80 rounded-xl object-contain"
                />
              )}
              {activeTab === 'back' && (
                <img
                  src={exercise.backMuscleImage}
                  alt={`${exercise.name} back muscles`}
                  className="mx-auto max-h-80 rounded-xl object-contain"
                />
              )}
              {activeTab === 'video' && (
                <video
                  src={exercise.video}
                  controls
                  className="w-full rounded-xl"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
