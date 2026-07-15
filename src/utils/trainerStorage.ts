import type { Trainer } from '../types/trainer'
import { api } from '../lib/api'

export async function getAllTrainers(): Promise<Trainer[]> {
  return api.getTrainers()
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
