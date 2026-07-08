import { useEffect, useState, useCallback } from 'react'

import { getAllExercises } from '../utils/exerciseStorage'
import { seedSampleExercises } from '../data/sampleExercises'

import ExerciseForm from './ExerciseForm'

import ExerciseList from './ExerciseList'

import ThemeToggle from './ThemeToggle'
import AdminManager from './AdminManager'
import { useAuth } from '../hooks/useAuth'

import type { Exercise, TabId } from '../types/exercise'



const tabs: { id: TabId; label: string; icon: string }[] = [

  { id: 'add', label: 'Add Exercise', icon: 'M12 4.5v15m7.5-7.5h-15' },

  {

    id: 'library',

    label: 'Exercise Library',

    icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 5.25v2.25m0-4.5h4.5m-4.5 0v4.5m0-4.5H6m4.5 0h4.5M3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25v2.25A2.25 2.25 0 018.25 21H6a2.25 2.25 0 01-2.25-2.25v-2.25zm9-9A2.25 2.25 0 0114.25 6h2.25A2.25 2.25 0 0118.75 8.25v2.25A2.25 2.25 0 0116.5 12.75h-2.25a2.25 2.25 0 01-2.25-2.25V8.25z',

  },

  {

    id: 'admins',

    label: 'Admins',

    icon: 'M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z',

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

  admins: {

    title: 'Admin Management',

    subtitle: 'Add and manage admins who can access this panel',

  },

}



export default function AdminPanel() {

  const { user, logout } = useAuth()

  const [activeTab, setActiveTab] = useState<TabId>('add')

  const [exercises, setExercises] = useState<Exercise[]>([])

  const [loading, setLoading] = useState(true)

  const [toast, setToast] = useState<string | null>(null)



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

    let cancelled = false



    void (async () => {

      try {

        await seedSampleExercises()

        const data = await getAllExercises()

        if (!cancelled) setExercises(data)

      } finally {

        if (!cancelled) setLoading(false)

      }

    })()



    return () => {

      cancelled = true

    }

  }, [])



  function showToast(message: string) {

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



        <nav className="flex-1 space-y-1 p-4">

          {tabs.map((tab) => (

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

              onClick={logout}

              aria-label="Log out"

              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-fg-muted transition hover:bg-hover hover:text-fg"

            >

              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>

                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />

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

              <h1 className="text-xl font-bold text-fg">

                {pageMeta[activeTab].title}

              </h1>

              <p className="mt-0.5 text-sm text-fg-muted">

                {pageMeta[activeTab].subtitle}

              </p>

            </div>



            <div className="flex items-center gap-2">

              <div className="flex gap-2 lg:hidden">

                {tabs.map((tab) => (

                  <button

                    key={tab.id}

                    type="button"

                    onClick={() => setActiveTab(tab.id)}

                    className={`rounded-lg px-3 py-1.5 text-xs font-medium ${

                      activeTab === tab.id

                        ? 'bg-brand-600 text-white'

                        : 'bg-muted text-fg-secondary'

                    }`}

                  >

                    {tab.label}

                  </button>

                ))}

              </div>

              <button

                type="button"

                onClick={logout}

                aria-label="Log out"

                className="rounded-xl border border-border bg-muted/50 p-2 text-fg-muted transition hover:bg-hover hover:text-fg lg:hidden"

              >

                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>

                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />

                </svg>

              </button>

              <ThemeToggle />

            </div>

          </div>

        </header>



        <main className="flex-1 overflow-y-auto p-4 lg:p-8">

          {activeTab === 'admins' ? (

            <div className="mx-auto max-w-5xl">

              <AdminManager onNotify={showToast} />

            </div>

          ) : activeTab === 'add' ? (

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


