import { Navigate, useLocation } from 'react-router-dom'
import { useStore, type UserProfile } from '../../store/useStore'

type Role = UserProfile['role']

export function RequireRole({ roles, children }: { roles: Role[]; children: JSX.Element }) {
  const user = useStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

