import type { ManagedUser, UserUpdatePayload } from '../types/user'
import { api } from '../lib/api'

export async function getAllUsers(): Promise<ManagedUser[]> {
  return api.getUsers()
}

export async function updateUser(
  id: string,
  payload: UserUpdatePayload,
): Promise<ManagedUser> {
  return api.updateUser(id, payload)
}
