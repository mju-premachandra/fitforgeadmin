export type AdminRole = 'owner' | 'admin'

export interface Admin {
  id: string
  name: string
  email: string
  role: AdminRole
  passwordHash: string
  createdAt: string
}

export interface AdminFormData {
  name: string
  email: string
  role: AdminRole
  password: string
  confirmPassword: string
}
