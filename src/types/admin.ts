export type AdminRole = 'owner' | 'admin' | 'trainer'

export interface Admin {
  id: string
  name: string
  email: string
  role: AdminRole
  createdAt: string
  updatedAt: string
}

export interface AdminFormData {
  name: string
  email: string
  role: AdminRole
  password: string
  confirmPassword: string
}
