import { useAuth } from '../hooks/useAuth'
import AdminPanel from './AdminPanel'
import Login from './Login'

export default function AuthGate() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <AdminPanel /> : <Login />
}
