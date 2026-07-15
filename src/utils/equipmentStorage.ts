import type { Equipment } from '../types/equipment'
import { api } from '../lib/api'

export async function getAllEquipment(): Promise<Equipment[]> {
  return api.getEquipment()
}

export async function saveEquipment(equipment: Equipment): Promise<Equipment> {
  const payload = {
    name: equipment.name,
    category: equipment.category,
    imageUrl: equipment.imageUrl,
    description: equipment.description ?? undefined,
  }

  try {
    return await api.updateEquipment(equipment.id, payload)
  } catch {
    return api.createEquipment({
      id: equipment.id,
      name: payload.name,
      category: payload.category,
      ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
      description: payload.description,
    })
  }
}

export async function deleteEquipment(id: string): Promise<void> {
  await api.deleteEquipment(id)
}
