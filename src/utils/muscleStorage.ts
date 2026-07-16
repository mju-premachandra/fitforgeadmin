import type { Muscle } from '../types/muscle'
import { api } from '../lib/api'

export async function getAllMuscles(): Promise<Muscle[]> {
  return api.getMuscles()
}

export async function saveMuscle(muscle: Muscle): Promise<Muscle> {
  const payload = {
    name: muscle.name,
    description: muscle.description ?? undefined,
    imageUrl: muscle.imageUrl,
  }

  try {
    return await api.updateMuscle(muscle.id, payload)
  } catch {
    return api.createMuscle({ id: muscle.id, ...payload })
  }
}

export async function deleteMuscle(id: string): Promise<void> {
  await api.deleteMuscle(id)
}
