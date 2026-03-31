import { Navigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

