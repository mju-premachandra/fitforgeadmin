import { createContext } from 'react'

export type AuthRole = 'admin' | 'user'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: AuthRole
}

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
