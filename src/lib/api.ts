import { upload as uploadToBlob } from '@vercel/blob/client'
import { API_BASE_URL } from './auth-client'
import { blobPathname, type MediaUploadKind } from './blob-config'

export { API_BASE_URL }

export interface UploadMediaResponse {
  url: string
}

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const data = (await response.json()) as { message?: string | string[] }
      if (Array.isArray(data.message)) message = data.message.join(', ')
      else if (data.message) message = data.message
    } catch {
      // ignore json parse errors
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export interface ApiExercise {
  id: string
  name: string
  instructions: string
  frontMuscleImage: string
  backMuscleImage: string
  video: string
  createdAt: string
  updatedAt: string
}

export interface ApiEquipment {
  id: string
  slug: string
  name: string
  category: string
  imageUrl: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiTrainer {
  id: string
  name: string
  specialty: string
  experienceYears: number
  description: string | null
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export interface ApiTrainerListResponse {
  items: ApiTrainer[]
  total: number
  page: number
  limit: number
  totalPages: number
  specialties: string[]
}

export interface ApiMuscle {
  id: string
  slug: string
  name: string
  description: string | null
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export interface ApiUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: 'user' | 'admin'
  banned: boolean
  banReason: string | null
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiUserWorkoutStat {
  userId: string
  name: string
  email: string
  workoutsCompleted: number
}

export interface ApiDashboardStats {
  totalNormalUsers: number
  totalCoaches: number
  workoutsByUser: ApiUserWorkoutStat[]
}

export type ChallengeType =
  | 'workout_count'
  | 'totalVolume'
  | 'streak_days'
  | 'water_goal'

export interface ApiChallenge {
  id: string
  title: string
  description: string | null
  challengeType: ChallengeType
  target: number
  isOfficial: boolean
  startDate: string | null
  endDate: string | null
  participantCount: number
  creator: { id: string; name: string; email: string }
  createdAt: string
  updatedAt: string
}

export interface ApiChallengeParticipant {
  id: string
  userId: string
  name: string
  email: string
  progress: number
  joinedAt: string
}

const ADMIN_EXERCISES = '/api/v1/admin/exercises'
const ADMIN_EQUIPMENT = '/api/v1/admin/equipment'
const ADMIN_TRAINERS = '/api/v1/admin/trainers'
const ADMIN_MUSCLES = '/api/v1/admin/muscles'
const ADMIN_USERS = '/api/v1/admin/users'
const ADMIN_DASHBOARD = '/api/v1/admin/dashboard'
const ADMIN_CHALLENGES = '/api/v1/admin/challenges'

export const api = {
  getDashboardStats() {
    return request<ApiDashboardStats>(`${ADMIN_DASHBOARD}/stats`)
  },
  getExercises() {
    return request<ApiExercise[]>(ADMIN_EXERCISES)
  },
  createExercise(payload: {
    id?: string
    name: string
    instructions: string
    frontMuscleImage: string
    backMuscleImage: string
    video: string
  }) {
    return request<ApiExercise>(ADMIN_EXERCISES, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateExercise(
    id: string,
    payload: Partial<Omit<ApiExercise, 'id' | 'createdAt' | 'updatedAt'>>,
  ) {
    return request<ApiExercise>(`${ADMIN_EXERCISES}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteExercise(id: string) {
    return request<{ id: string; deleted: boolean }>(`${ADMIN_EXERCISES}/${id}`, {
      method: 'DELETE',
    })
  },
  getEquipment() {
    return request<ApiEquipment[]>(ADMIN_EQUIPMENT)
  },
  createEquipment(payload: {
    id?: string
    name: string
    category: string
    imageUrl?: string
    description?: string
  }) {
    return request<ApiEquipment>(ADMIN_EQUIPMENT, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateEquipment(
    id: string,
    payload: Partial<
      Omit<ApiEquipment, 'id' | 'slug' | 'createdAt' | 'updatedAt'>
    >,
  ) {
    return request<ApiEquipment>(`${ADMIN_EQUIPMENT}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteEquipment(id: string) {
    return request<{ id: string; deleted: boolean }>(`${ADMIN_EQUIPMENT}/${id}`, {
      method: 'DELETE',
    })
  },
  getTrainers(params?: {
    search?: string
    specialty?: string
    page?: number
    limit?: number
  }) {
    const query = new URLSearchParams()
    if (params?.search?.trim()) query.set('search', params.search.trim())
    if (params?.specialty?.trim()) query.set('specialty', params.specialty.trim())
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    return request<ApiTrainerListResponse>(
      `${ADMIN_TRAINERS}${qs ? `?${qs}` : ''}`,
    )
  },
  createTrainer(payload: {
    id?: string
    name: string
    specialty: string
    experienceYears: number
    description: string
    imageUrl: string
  }) {
    return request<ApiTrainer>(ADMIN_TRAINERS, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateTrainer(
    id: string,
    payload: Partial<Omit<ApiTrainer, 'id' | 'createdAt' | 'updatedAt'>>,
  ) {
    return request<ApiTrainer>(`${ADMIN_TRAINERS}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteTrainer(id: string) {
    return request<{ id: string; deleted: boolean }>(`${ADMIN_TRAINERS}/${id}`, {
      method: 'DELETE',
    })
  },
  getMuscles() {
    return request<ApiMuscle[]>(ADMIN_MUSCLES)
  },
  createMuscle(payload: {
    id?: string
    name: string
    description?: string
    imageUrl: string
  }) {
    return request<ApiMuscle>(ADMIN_MUSCLES, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateMuscle(
    id: string,
    payload: Partial<Omit<ApiMuscle, 'id' | 'slug' | 'createdAt' | 'updatedAt'>>,
  ) {
    return request<ApiMuscle>(`${ADMIN_MUSCLES}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteMuscle(id: string) {
    return request<{ id: string; deleted: boolean }>(`${ADMIN_MUSCLES}/${id}`, {
      method: 'DELETE',
    })
  },
  getUsers() {
    return request<ApiUser[]>(ADMIN_USERS)
  },
  updateUser(
    id: string,
    payload: Partial<Pick<ApiUser, 'role' | 'banned' | 'banReason'>>,
  ) {
    return request<ApiUser>(`${ADMIN_USERS}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  getChallenges(params?: { scope?: 'all' | 'official' | 'user'; search?: string }) {
    const query = new URLSearchParams()
    if (params?.scope) query.set('scope', params.scope)
    if (params?.search?.trim()) query.set('search', params.search.trim())
    const qs = query.toString()
    return request<ApiChallenge[]>(`${ADMIN_CHALLENGES}${qs ? `?${qs}` : ''}`)
  },
  createChallenge(payload: {
    title: string
    description?: string
    challengeType: ChallengeType
    target: number
    startDate?: string
    endDate?: string
  }) {
    return request<ApiChallenge>(ADMIN_CHALLENGES, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateChallenge(
    id: string,
    payload: Partial<{
      title: string
      description: string
      challengeType: ChallengeType
      target: number
      startDate: string | null
      endDate: string | null
    }>,
  ) {
    return request<ApiChallenge>(`${ADMIN_CHALLENGES}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  getChallengeParticipants(id: string) {
    return request<ApiChallengeParticipant[]>(`${ADMIN_CHALLENGES}/${id}/participants`)
  },
  deleteChallenge(id: string) {
    return request<{ id: string; deleted: boolean }>(`${ADMIN_CHALLENGES}/${id}`, {
      method: 'DELETE',
    })
  },
  async uploadMedia(
    file: File,
    kind: MediaUploadKind,
  ): Promise<UploadMediaResponse> {
    const handleUploadUrl =
      import.meta.env.VITE_BLOB_UPLOAD_URL ?? '/api/media/upload'

    const blob = await uploadToBlob(blobPathname(kind, file.name), file, {
      access: 'public',
      handleUploadUrl,
    })

    return { url: blob.url }
  },
}

export { ApiError }
