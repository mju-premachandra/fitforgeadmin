import type { Trainer } from '../types/trainer'
import { api } from '../lib/api'

export interface TrainerListResult {
  items: Trainer[]
  total: number
  page: number
  limit: number
  totalPages: number
  specialties: string[]
}

export async function getTrainers(params?: {
  search?: string
  specialty?: string
  page?: number
  limit?: number
}): Promise<TrainerListResult> {
  return api.getTrainers(params)
}

/** Lightweight total count for sidebar badge. */
export async function getTrainerCount(): Promise<number> {
  const result = await api.getTrainers({ page: 1, limit: 1 })
  return result.total
}

export async function saveTrainer(trainer: Trainer): Promise<Trainer> {
  const payload = {
    name: trainer.name,
    specialty: trainer.specialty,
    experienceYears: trainer.experienceYears,
    description: trainer.description ?? '',
    imageUrl: trainer.imageUrl,
  }

  try {
    return await api.updateTrainer(trainer.id, payload)
  } catch {
    return api.createTrainer({
      id: trainer.id,
      ...payload,
    })
  }
}

export async function deleteTrainer(id: string): Promise<void> {
  await api.deleteTrainer(id)
}
