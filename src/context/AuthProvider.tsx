import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext, type AuthRole, type AuthUser } from './auth-context'
import { authClient } from '../lib/auth-client'

function hasAdminRole(role: unknown): boolean {
  if (typeof role !== 'string') return false
  return role
    .split(',')
    .map((part) => part.trim())
    .includes('admin')
}

function toAuthUser(user: {
  id: string
  name: string
  email: string
  role?: string | null
}): AuthUser | null {
  if (!hasAdminRole(user.role)) return null
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: 'admin' as AuthRole,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const session = await authClient.getSession()
        if (cancelled) return
        const next = session.data?.user
          ? toAuthUser(session.data.user as AuthUser & { role?: string | null })
          : null
        if (!next && session.data?.user) {
          await authClient.signOut()
        }
        setUser(next)
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  async function login(email: string, password: string): Promise<boolean> {
    const result = await authClient.signIn.email({ email, password })
    if (result.error) return false

    const session = await authClient.getSession()
    const next = session.data?.user
      ? toAuthUser(session.data.user as AuthUser & { role?: string | null })
      : null

    if (!next) {
      await authClient.signOut()
      return false
    }

    setUser(next)
    return true
  }

  async function logout() {
    await authClient.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
