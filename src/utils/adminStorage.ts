import type { Admin, AdminRole } from '../types/admin'

/** Admin user management will be wired to Better Auth later. */
export async function getAllAdmins(): Promise<Admin[]> {
  throw new Error('Admin management is not connected yet')
}

export async function saveAdmin(_payload: {
  name: string
  email: string
  password: string
  role: AdminRole
}): Promise<Admin> {
  throw new Error('Admin management is not connected yet')
}

export async function deleteAdmin(_id: string): Promise<void> {
  throw new Error('Admin management is not connected yet')
}
