import { useEffect, useState, useCallback } from 'react'
import { getAllExercises } from '../utils/exerciseStorage'
import ExerciseForm from './ExerciseForm'
import ExerciseList from './ExerciseList'

const tabs = [
  { id: 'add', label: 'Add Exercise', icon: 'M12 4.5v15m7.5-7.5h-15' },
  {
    id: 'library',
    label: 'Exercise Library',
    icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 5.25v2.25m0-4.5h4.5m-4.5 0v4.5m0-4.5H6m4.5 0h4.5M3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25v2.25A2.25 2.25 0 018.25 21H6a2.25 2.25 0 01-2.25-2.25v-2.25zm9-9A2.25 2.25 0 0114.25 6h2.25A2.25 2.25 0 0118.75 8.25v2.25A2.25 2.25 0 0116.5 12.75h-2.25a2.25 2.25 0 01-2.25-2.25V8.25z',
  },
]

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('add')
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const loadExercises = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllExercises()
      setExercises(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExercises()
  }, [loadExercises])

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  function handleSaved() {
    loadExercises()
    showToast('Exercise saved successfully!')
    setActiveTab('library')
  }

  function handleUpdated() {
    loadExercises()
    showToast('Exercise updated successfully!')
  }

  return (
    <div className="flex min-h-svh bg-surface-900">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-surface-800 lg:flex">
        <div className="border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white">FitForge</p>
              <p className="text-xs text-slate-400">Trainer Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-brand-600/15 text-brand-500'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
              {tab.id === 'library' && exercises.length > 0 && (
                <span className="ml-auto rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                  {exercises.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="border-b border-slate-800 bg-surface-800/80 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">
                {activeTab === 'add' ? 'Add New Exercise' : 'Exercise Library'}
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                {activeTab === 'add'
                  ? 'Create exercises with instructions, muscle diagrams, and demo videos'
                  : 'Browse and manage all exercises in your library'}
              </p>
            </div>

            <div className="flex gap-2 lg:hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    activeTab === tab.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {activeTab === 'add' ? (
            <div className="mx-auto max-w-3xl">
              <ExerciseForm onSaved={handleSaved} />
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="h-8 w-8 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <ExerciseList
                exercises={exercises}
                onRefresh={loadExercises}
                onUpdated={handleUpdated}
              />
            </div>
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-medium text-white shadow-xl shadow-brand-600/30">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  )
}
