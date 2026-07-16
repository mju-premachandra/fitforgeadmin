import UserCard from './UserCard'
import type { ManagedUser } from '../types/user'

interface UserListProps {
  users: ManagedUser[]
  onRefresh?: () => void
}

export default function UserList({ users, onRefresh }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <svg className="h-7 w-7 text-fg-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.75a3 3 0 01-3-3V14.25m6 0a3 3 0 01-3 3m3-3h.008v.008H21v-.008zm0 0V9.75a3 3 0 00-3-3h-3m3 3h.008v.008H18V9.75zm-12 0a3 3 0 013-3h3m-3 3h.008v.008H6V9.75zm0 0V5.25a3 3 0 013-3h3m-3 3h.008v.008H6v-.008z" />
          </svg>
        </div>
        <h3 className="text-base font-medium text-fg-secondary">No users yet</h3>
        <p className="mt-1 max-w-xs text-sm text-fg-subtle">
          Registered users will appear here for management.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-fg-muted">
        {users.length} user{users.length !== 1 ? 's' : ''} registered
      </p>
      <div className="grid gap-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} onRefresh={onRefresh} />
        ))}
      </div>
    </div>
  )
}
