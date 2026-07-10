import { upload as uploadToBlob } from '@vercel/blob/client'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

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

export interface ApiAuthUser {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'TRAINER'
}

export interface ApiLoginResponse {
  user: ApiAuthUser
}

export interface ApiAdmin {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'TRAINER'
  createdAt: string
  updatedAt: string
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

export const api = {
  login(email: string, password: string) {
    return request<ApiLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  getAdmins() {
    return request<ApiAdmin[]>('/admins')
  },
  createAdmin(payload: {
    name: string
    email: string
    password: string
    role: 'OWNER' | 'ADMIN' | 'TRAINER'
  }) {
    return request<ApiAdmin>('/admins', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  deleteAdmin(id: string) {
    return request<{ success: boolean }>(`/admins/${id}`, { method: 'DELETE' })
  },
  getExercises() {
    return request<ApiExercise[]>('/exercises')
  },
  createExercise(payload: {
    id?: string
    name: string
    instructions: string
    frontMuscleImage: string
    backMuscleImage: string
    video: string
  }) {
    return request<ApiExercise>('/exercises', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateExercise(id: string, payload: Partial<Omit<ApiExercise, 'id' | 'createdAt' | 'updatedAt'>>) {
    return request<ApiExercise>(`/exercises/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteExercise(id: string) {
    return request<{ success: boolean }>(`/exercises/${id}`, { method: 'DELETE' })
  },
  async uploadMedia(file: File): Promise<UploadMediaResponse> {
    const handleUploadUrl =
      import.meta.env.VITE_BLOB_UPLOAD_URL ?? '/api/media/upload'

    const blob = await uploadToBlob(file.name, file, {
      access: 'public',
      handleUploadUrl,
    })

    return { url: blob.url }
  },
}

export { ApiError }
