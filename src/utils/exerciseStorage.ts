import type { Exercise } from '../types/exercise'
import { api } from '../lib/api'

export async function getAllExercises(): Promise<Exercise[]> {
  return api.getExercises()
}

export async function saveExercise(exercise: Exercise): Promise<Exercise> {
  const payload = {
    name: exercise.name,
    instructions: exercise.instructions,
    frontMuscleImage: exercise.frontMuscleImage,
    backMuscleImage: exercise.backMuscleImage,
    video: exercise.video,
  }

  try {
    return await api.updateExercise(exercise.id, payload)
  } catch {
    return api.createExercise({ id: exercise.id, ...payload })
  }
}

export async function deleteExercise(id: string): Promise<void> {
  await api.deleteExercise(id)
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
