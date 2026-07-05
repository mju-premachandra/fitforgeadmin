import { useState } from 'react'
import ExerciseCard from './ExerciseCard'
import ExerciseForm from './ExerciseForm'

export default function ExerciseList({ exercises, onRefresh, onUpdated }) {
  const [editingExercise, setEditingExercise] = useState(null)

  function handleSaved() {
    setEditingExercise(null)
    onRefresh?.()
    onUpdated?.()
  }

  if (editingExercise) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setEditingExercise(null)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to library
        </button>

        <div>
          <h2 className="text-lg font-semibold text-white">Edit Exercise</h2>
          <p className="mt-1 text-sm text-slate-400">
            Update details for &ldquo;{editingExercise.name}&rdquo;
          </p>
        </div>

        <ExerciseForm
          exercise={editingExercise}
          onSaved={handleSaved}
          onCancel={() => setEditingExercise(null)}
        />
      </div>
    )
  }

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
          <svg
            className="h-7 w-7 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 5.25v2.25m0-4.5h4.5m-4.5 0v4.5m0-4.5H6m4.5 0h4.5M3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25v2.25A2.25 2.25 0 018.25 21H6a2.25 2.25 0 01-2.25-2.25v-2.25zm9-9A2.25 2.25 0 0114.25 6h2.25A2.25 2.25 0 0118.75 8.25v2.25A2.25 2.25 0 0116.5 12.75h-2.25a2.25 2.25 0 01-2.25-2.25V8.25z"
            />
          </svg>
        </div>
        <h3 className="text-base font-medium text-slate-300">No exercises yet</h3>
        <p className="mt-1 max-w-xs text-sm text-slate-500">
          Add your first exercise using the form. It will appear here for review.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} in library
      </p>
      <div className="grid gap-4">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onEdit={setEditingExercise}
            onDeleted={onRefresh}
          />
        ))}
      </div>
    </div>
  )
}
