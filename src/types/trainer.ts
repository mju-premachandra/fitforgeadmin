export interface Trainer {
  id: string
  name: string
  specialty: string
  experienceYears: number
  description: string | null
  imageUrl: string
  createdAt: string
  updatedAt: string
}

export interface TrainerFormData {
  name: string
  specialty: string
  experienceYears: string
  description: string
  image: File | null
}

export const TRAINER_SPECIALTIES = [
  'Strength Training',
  'Weight Loss',
  'Bodybuilding',
  'Yoga',
  'CrossFit',
  'Cardio',
  'Sports Performance',
  'Rehabilitation',
  'Nutrition',
  'Other',
] as const
