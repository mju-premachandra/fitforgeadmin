import type { Equipment } from '../types/equipment'
import type { Exercise } from '../types/exercise'
import { useAuth } from '../hooks/useAuth'
import { getAllEquipment } from '../utils/equipmentStorage'
import { getAllExercises } from '../utils/exerciseStorage'
import EquipmentForm from './EquipmentForm'
import EquipmentList from './EquipmentList'
import ExerciseForm from './ExerciseForm'
import ExerciseList from './ExerciseList'
import ThemeToggle from './ThemeToggle'
import { useCallback, useEffect, useState } from 'react'

type TabId = 'add' | 'library' | 'add-equipment' | 'equipment-library'

const tabs: { id: TabId; label: string; icon: string }[] = [
  {
    id: 'add',
    label: 'Add Exercise',
    icon: 'M12 4.5v15m7.5-7.5h-15',
  },
  {
    id: 'library',
    label: 'Exercise Library',
    icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 5.25v2.25m0-4.5h4.5m-4.5 0v4.5m0-4.5H6m4.5 0h4.5M3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25v2.25A2.25 2.25 0 018.25 21H6a2.25 2.25 0 01-2.25-2.25v-2.25zm9-9A2.25 2.25 0 0114.25 6h2.25A2.25 2.25 0 0118.75 8.25v2.25A2.25 2.25 0 0116.5 12.75h-2.25a2.25 2.25 0 01-2.25-2.25V8.25z',
  },
  {
    id: 'add-equipment',
    label: 'Add Equipment',
    icon: 'M12 4.5v15m7.5-7.5h-15',
  },
  {
    id: 'equipment-library',
    label: 'Equipment Library',
    icon: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
  },
]

const pageMeta: Record<TabId, { title: string; subtitle: string }> = {
  add: {
    title: 'Add New Exercise',
    subtitle: 'Create exercises with instructions, muscle diagrams, and demo videos',
  },
  library: {
    title: 'Exercise Library',
    subtitle: 'Browse and manage all exercises in your library',
  },
  'add-equipment': {
    title: 'Add Equipment',
    subtitle: 'Create equipment with a category, optional picture, and description',
  },
  'equipment-library': {
    title: 'Equipment Library',
    subtitle: 'Browse and manage all equipment in your library',
  },
}

export default function AdminPanel() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('add')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loadingExercises, setLoadingExercises] = useState(true)
  const [loadingEquipment, setLoadingEquipment] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const loadExercises = useCallback(async () => {
    setLoadingExercises(true)
    try {
      const data = await getAllExercises()
      setExercises(data)
    } finally {
      setLoadingExercises(false)
    }
  }, [])

  const loadEquipment = useCallback(async () => {
    setLoadingEquipment(true)
    try {
      const data = await getAllEquipment()
      setEquipment(data)
    } finally {
      setLoadingEquipment(false)
    }
  }, [])

  useEffect(() => {
    void loadExercises()
    void loadEquipment()
  }, [loadExercises, loadEquipment])

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  function handleExerciseSaved() {
    void loadExercises()
    showToast('Exercise saved successfully!')
    setActiveTab('library')
  }

  function handleExerciseUpdated() {
    void loadExercises()
    showToast('Exercise updated successfully!')
  }

  function handleEquipmentSaved() {
    void loadEquipment()
    showToast('Equipment saved successfully!')
    setActiveTab('equipment-library')
  }

  function handleEquipmentUpdated() {
    void loadEquipment()
    showToast('Equipment updated successfully!')
  }

  const loading =
    (activeTab === 'library' && loadingExercises) ||
    (activeTab === 'equipment-library' && loadingEquipment)

  return (
    <div className="flex h-svh overflow-hidden bg-surface-900">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface-800 lg:flex">
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-fg">FitForge</p>
              <p className="text-xs text-fg-muted">Trainer Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
            Exercises
          </p>
          {tabs
            .filter((tab) => tab.id === 'add' || tab.id === 'library')
            .map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-brand-600/15 text-brand-500'
                    : 'text-fg-muted hover:bg-hover/50 hover:text-fg'
                }`}
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
                {tab.id === 'library' && exercises.length > 0 && (
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-fg-secondary">
                    {exercises.length}
                  </span>
                )}
              </button>
            ))}

          <p className="mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
            Equipment
          </p>
          {tabs
            .filter((tab) => tab.id === 'add-equipment' || tab.id === 'equipment-library')
            .map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-brand-600/15 text-brand-500'
                    : 'text-fg-muted hover:bg-hover/50 hover:text-fg'
                }`}
              >
                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
                {tab.id === 'equipment-library' && equipment.length > 0 && (
                  <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-fg-secondary">
                    {equipment.length}
                  </span>
                )}
              </button>
            ))}
        </nav>

        <div className="space-y-3 border-t border-border p-4">
          {user && (
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600/15 text-xs font-semibold uppercase text-brand-500">
                {user.name.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-fg">{user.name}</p>
                <p className="truncate text-xs text-fg-muted">{user.email}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void logout()}
              aria-label="Log out"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-fg-muted transition hover:bg-hover hover:text-fg"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <header className="border-b border-border bg-surface-800/80 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-fg">{pageMeta[activeTab].title}</h1>
              <p className="mt-0.5 text-sm text-fg-muted">{pageMeta[activeTab].subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex max-w-[60vw] gap-2 overflow-x-auto lg:hidden">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                      activeTab === tab.id ? 'bg-brand-600 text-white' : 'bg-muted text-fg-secondary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                aria-label="Log out"
                className="rounded-xl border border-border bg-muted/50 p-2 text-fg-muted transition hover:bg-hover hover:text-fg lg:hidden"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {activeTab === 'add' ? (
            <div className="mx-auto max-w-3xl">
              <ExerciseForm onSaved={handleExerciseSaved} />
            </div>
          ) : activeTab === 'add-equipment' ? (
            <div className="mx-auto max-w-3xl">
              <EquipmentForm onSaved={handleEquipmentSaved} />
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <svg className="h-8 w-8 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          ) : activeTab === 'library' ? (
            <div className="mx-auto max-w-3xl">
              <ExerciseList
                exercises={exercises}
                onRefresh={loadExercises}
                onUpdated={handleExerciseUpdated}
              />
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              <EquipmentList
                equipment={equipment}
                onRefresh={loadEquipment}
                onUpdated={handleEquipmentUpdated}
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
