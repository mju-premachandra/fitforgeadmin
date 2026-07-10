import { useState, type ReactNode } from 'react'
import { AuthContext, type AuthUser } from './auth-context'
import { ApiError, api } from '../lib/api'

const STORAGE_KEY = 'fitforge-auth'

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)

  function persist(next: AuthUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setUser(next)
  }

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const result = await api.login(email, password)
      persist({
        name: result.user.name,
        email: result.user.email,
        role: result.user.role.toLowerCase() as AuthUser['role'],
      })
      return true
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return false
      throw error
    }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
