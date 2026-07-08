import { createContext } from 'react'
import type { AdminRole } from '../types/admin'

export interface AuthUser {
  name: string
  email: string
  role: AdminRole
}

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
