import type { Admin } from '../types/admin'
import { api } from '../lib/api'

export async function getAllAdmins(): Promise<Admin[]> {
  const admins = await api.getAdmins()
  return admins.map((admin) => ({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role.toLowerCase() as Admin['role'],
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  }))
}

export async function saveAdmin(input: {
  name: string
  email: string
  password: string
  role: Admin['role']
}): Promise<Admin> {
  const created = await api.createAdmin({
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role.toUpperCase() as 'OWNER' | 'ADMIN' | 'TRAINER',
  })

  return {
    id: created.id,
    name: created.name,
    email: created.email,
    role: created.role.toLowerCase() as Admin['role'],
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  }
}

export async function deleteAdmin(id: string): Promise<void> {
  await api.deleteAdmin(id)
}
