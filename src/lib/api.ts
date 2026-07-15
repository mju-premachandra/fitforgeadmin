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

const ADMIN_EXERCISES = '/api/v1/admin/exercises'
const ADMIN_EQUIPMENT = '/api/v1/admin/equipment'

export const api = {
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
