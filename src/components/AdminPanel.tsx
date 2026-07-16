import type { Equipment } from '../types/equipment'
import type { Exercise } from '../types/exercise'
import type { Muscle } from '../types/muscle'
import type { Trainer } from '../types/trainer'
import type { ManagedUser } from '../types/user'
import { useAuth } from '../hooks/useAuth'
import { getAllEquipment } from '../utils/equipmentStorage'
import { getAllExercises } from '../utils/exerciseStorage'
import { getAllMuscles } from '../utils/muscleStorage'
import { getAllTrainers } from '../utils/trainerStorage'
import { getAllUsers } from '../utils/userStorage'
import EquipmentForm from './EquipmentForm'
import EquipmentList from './EquipmentList'
import ExerciseForm from './ExerciseForm'
import ExerciseList from './ExerciseList'
import MuscleForm from './MuscleForm'
import MuscleList from './MuscleList'
import TrainerForm from './TrainerForm'
import TrainerList from './TrainerList'
import UserList from './UserList'
import ThemeToggle from './ThemeToggle'
import { useCallback, useEffect, useState } from 'react'

type TabId =
  | 'add'
  | 'library'
  | 'add-equipment'
  | 'equipment-library'
  | 'add-trainer'
  | 'trainer-library'
  | 'add-muscle'
  | 'muscle-library'
  | 'users'

type TabGroup = 'exercises' | 'equipment' | 'trainers' | 'muscles' | 'users'

const tabs: { id: TabId; label: string; icon: string; group: TabGroup }[] = [
  { id: 'add', label: 'Add Exercise', group: 'exercises', icon: 'M12 4.5v15m7.5-7.5h-15' },
  {
    id: 'library',
    label: 'Exercise Library',
    group: 'exercises',
    icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 5.25v2.25m0-4.5h4.5m-4.5 0v4.5m0-4.5H6m4.5 0h4.5M3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25v2.25A2.25 2.25 0 018.25 21H6a2.25 2.25 0 01-2.25-2.25v-2.25zm9-9A2.25 2.25 0 0114.25 6h2.25A2.25 2.25 0 0118.75 8.25v2.25A2.25 2.25 0 0116.5 12.75h-2.25a2.25 2.25 0 01-2.25-2.25V8.25z',
  },
  { id: 'add-equipment', label: 'Add Equipment', group: 'equipment', icon: 'M12 4.5v15m7.5-7.5h-15' },
  {
    id: 'equipment-library',
    label: 'Equipment Library',
    group: 'equipment',
    icon: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
  },
  { id: 'add-trainer', label: 'Add Trainer', group: 'trainers', icon: 'M12 4.5v15m7.5-7.5h-15' },
  {
    id: 'trainer-library',
    label: 'Trainer Library',
    group: 'trainers',
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  },
  { id: 'add-muscle', label: 'Add Muscle', group: 'muscles', icon: 'M12 4.5v15m7.5-7.5h-15' },
  {
    id: 'muscle-library',
    label: 'Muscle Library',
    group: 'muscles',
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  },
  {
    id: 'users',
    label: 'User Management',
    group: 'users',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
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
  'add-trainer': {
    title: 'Add Trainer',
    subtitle: 'Add trainers with specialty, experience, description, and a profile photo',
  },
  'trainer-library': {
    title: 'Trainer Management',
    subtitle: 'Browse and manage all trainers',
  },
  'add-muscle': {
    title: 'Add Muscle',
    subtitle: 'Add muscle groups with details and a reference picture',
  },
  'muscle-library': {
    title: 'Muscle Library',
    subtitle: 'Browse and manage all muscles',
  },
  users: {
    title: 'User Management',
    subtitle: 'View registered users, change roles, and manage bans',
  },
}

const groupLabels: Record<TabGroup, string> = {
  exercises: 'Exercises',
  equipment: 'Equipment',
  trainers: 'Trainer Management',
  muscles: 'Muscles',
  users: 'User Management',
}

export default function AdminPanel() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('add')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [muscles, setMuscles] = useState<Muscle[]>([])
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loadingExercises, setLoadingExercises] = useState(true)
  const [loadingEquipment, setLoadingEquipment] = useState(true)
  const [loadingTrainers, setLoadingTrainers] = useState(true)
  const [loadingMuscles, setLoadingMuscles] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const loadExercises = useCallback(async () => {
    setLoadingExercises(true)
    try {
      setExercises(await getAllExercises())
    } finally {
      setLoadingExercises(false)
    }
  }, [])

  const loadEquipment = useCallback(async () => {
    setLoadingEquipment(true)
    try {
      setEquipment(await getAllEquipment())
    } finally {
      setLoadingEquipment(false)
    }
  }, [])

  const loadTrainers = useCallback(async () => {
    setLoadingTrainers(true)
    try {
      setTrainers(await getAllTrainers())
    } finally {
      setLoadingTrainers(false)
    }
  }, [])

  const loadMuscles = useCallback(async () => {
    setLoadingMuscles(true)
    try {
      setMuscles(await getAllMuscles())
    } finally {
      setLoadingMuscles(false)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      setUsers(await getAllUsers())
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  useEffect(() => {
    void loadExercises()
    void loadEquipment()
    void loadTrainers()
    void loadMuscles()
    void loadUsers()
  }, [loadExercises, loadEquipment, loadTrainers, loadMuscles, loadUsers])

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

  function handleTrainerSaved() {
    void loadTrainers()
    showToast('Trainer saved successfully!')
    setActiveTab('trainer-library')
  }

  function handleTrainerUpdated() {
    void loadTrainers()
    showToast('Trainer updated successfully!')
  }

  function handleMuscleSaved() {
    void loadMuscles()
    showToast('Muscle saved successfully!')
    setActiveTab('muscle-library')
  }

  function handleMuscleUpdated() {
    void loadMuscles()
    showToast('Muscle updated successfully!')
  }

  const counts: Partial<Record<TabId, number>> = {
    library: exercises.length,
    'equipment-library': equipment.length,
    'trainer-library': trainers.length,
    'muscle-library': muscles.length,
    users: users.length,
  }

  const loading =
    (activeTab === 'library' && loadingExercises) ||
    (activeTab === 'equipment-library' && loadingEquipment) ||
    (activeTab === 'trainer-library' && loadingTrainers) ||
    (activeTab === 'muscle-library' && loadingMuscles) ||
    (activeTab === 'users' && loadingUsers)

  function renderNavGroup(group: TabGroup) {
    return (
      <>
        <p
          className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle ${
            group === 'exercises' ? '' : 'mt-5'
          }`}
        >
          {groupLabels[group]}
        </p>
        {tabs
          .filter((tab) => tab.group === group)
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
              {counts[tab.id] !== undefined && counts[tab.id]! > 0 && (
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-fg-secondary">
                  {counts[tab.id]}
                </span>
              )}
            </button>
          ))}
      </>
    )
  }

  function renderMainContent() {
    if (activeTab === 'add') {
      return <ExerciseForm onSaved={handleExerciseSaved} />
    }
    if (activeTab === 'add-equipment') {
      return <EquipmentForm onSaved={handleEquipmentSaved} />
    }
    if (activeTab === 'add-trainer') {
      return <TrainerForm onSaved={handleTrainerSaved} />
    }
    if (activeTab === 'add-muscle') {
      return <MuscleForm onSaved={handleMuscleSaved} />
    }
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <svg className="h-8 w-8 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )
    }
    if (activeTab === 'library') {
      return (
        <ExerciseList
          exercises={exercises}
          onRefresh={loadExercises}
          onUpdated={handleExerciseUpdated}
        />
      )
    }
    if (activeTab === 'equipment-library') {
      return (
        <EquipmentList
          equipment={equipment}
          onRefresh={loadEquipment}
          onUpdated={handleEquipmentUpdated}
        />
      )
    }
    if (activeTab === 'trainer-library') {
      return (
        <TrainerList
          trainers={trainers}
          onRefresh={loadTrainers}
          onUpdated={handleTrainerUpdated}
        />
      )
    }
    if (activeTab === 'muscle-library') {
      return (
        <MuscleList
          muscles={muscles}
          onRefresh={loadMuscles}
          onUpdated={handleMuscleUpdated}
        />
      )
    }
    return (
      <UserList
        users={users}
        onRefresh={() => {
          void loadUsers()
          showToast('User updated successfully!')
        }}
      />
    )
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
              <p className="text-xs text-fg-muted">Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {renderNavGroup('exercises')}
          {renderNavGroup('equipment')}
          {renderNavGroup('trainers')}
          {renderNavGroup('muscles')}
          {renderNavGroup('users')}
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
          <button
            type="button"
            onClick={() => void logout()}
            aria-label="Log out"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-fg-muted transition hover:bg-hover hover:text-fg"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Log out
          </button>
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-3xl">{renderMainContent()}</div>
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
