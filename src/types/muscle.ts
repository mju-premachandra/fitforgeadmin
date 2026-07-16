export interface Muscle {
  id: string
  slug: string
  name: string
  description: string | null
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export interface MuscleFormData {
  name: string
  description: string
  image: File | null
}
