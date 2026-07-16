export type UserRole = 'user' | 'admin'

export interface ManagedUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: UserRole
  banned: boolean
  banReason: string | null
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface UserUpdatePayload {
  role?: UserRole
  banned?: boolean
  banReason?: string | null
}
