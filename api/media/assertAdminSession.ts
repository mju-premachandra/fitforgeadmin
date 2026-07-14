import type { IncomingMessage } from 'node:http'

function cookieHeader(request: unknown): string | undefined {
  if (!request || typeof request !== 'object') return undefined
  const headers = (request as IncomingMessage).headers
  const cookie = headers?.cookie
  if (!cookie) return undefined
  return Array.isArray(cookie) ? cookie.join('; ') : cookie
}

function hasAdminRole(role: unknown): boolean {
  if (typeof role !== 'string') return false
  return role
    .split(',')
    .map((part) => part.trim())
    .includes('admin')
}

export async function assertAdminSession(request: unknown): Promise<void> {
  const cookie = cookieHeader(request)
  if (!cookie) {
    throw new Error('Sign in as an admin before uploading files')
  }

  const apiBase =
    process.env.API_URL?.trim() ||
    process.env.VITE_API_URL?.trim() ||
    'http://localhost:3000'

  const response = await fetch(`${apiBase}/api/auth/get-session`, {
    headers: { cookie },
  })

  if (!response.ok) {
    throw new Error('Sign in as an admin before uploading files')
  }

  const session = (await response.json()) as {
    user?: { role?: string | null }
  }

  if (!hasAdminRole(session.user?.role)) {
    throw new Error('Admin access required to upload files')
  }
}
