import { useState, type ReactNode } from 'react'
import { AuthContext, type AuthUser } from './auth-context'
import { DEFAULT_ADMIN } from '../config/auth'
import { getAllAdmins, hashPassword } from '../utils/adminStorage'

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
    const normalized = email.trim().toLowerCase()

    // 1. Default credentials from src/config/auth.ts
    if (normalized === DEFAULT_ADMIN.email.toLowerCase() && password === DEFAULT_ADMIN.password) {
      persist({ name: DEFAULT_ADMIN.name, email: DEFAULT_ADMIN.email.toLowerCase(), role: 'owner' })
      return true
    }

    // 2. Admins created inside the app (stored in IndexedDB)
    const admins = await getAllAdmins()
    const match = admins.find((a) => a.email.toLowerCase() === normalized)
    if (match) {
      const hash = await hashPassword(password)
      if (hash === match.passwordHash) {
        persist({ name: match.name, email: match.email, role: match.role })
        return true
      }
    }

    return false
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
