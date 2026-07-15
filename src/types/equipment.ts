export interface Equipment {
  id: string
  slug: string
  name: string
  category: string
  imageUrl: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface EquipmentFormData {
  name: string
  category: string
  image: File | null
  description: string
}

export const EQUIPMENT_CATEGORIES = [
  'Free Weights',
  'Machines',
  'Cardio',
  'Bodyweight',
  'Accessories',
  'Other',
] as const

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number]
