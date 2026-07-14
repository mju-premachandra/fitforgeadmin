export interface Exercise {
  id: string
  name: string
  instructions: string
  frontMuscleImage: string
  backMuscleImage: string
  video: string
  createdAt: string
  updatedAt: string
}

export type MediaField = 'frontMuscleImage' | 'backMuscleImage' | 'video'

export interface ExerciseFormData {
  name: string
  instructions: string
  frontMuscleImage: File | null
  backMuscleImage: File | null
  video: File | null
}

export interface MediaPreviews {
  frontMuscleImage: string | null
  backMuscleImage: string | null
  video: string | null
}

export type TabId = 'add' | 'library'

export type MediaTab = 'front' | 'back' | 'video'
