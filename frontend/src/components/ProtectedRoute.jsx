import { useAuth0 } from '@auth0/auth0-react'
import { useAppUser } from '../context/UserContext'
import RoleSelect from '../pages/RoleSelect'
import LoadingScreen from './LoadingScreen'

/**
 * Wrap any route that requires login.
 * Flow: not logged in → Auth0 login → role not set → RoleSelect → dashboard
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading: auth0Loading, loginWithRedirect } = useAuth0()
  const { appUser, userLoading } = useAppUser()

  if (auth0Loading || userLoading) return <LoadingScreen />

  if (!isAuthenticated) {
    loginWithRedirect()
    return <LoadingScreen message="Redirecting to login…" />
  }

  // First-time user — needs to pick a role
  if (!appUser?.role) return <RoleSelect />

  // Role guard — if the page requires a specific role
  if (allowedRoles && !allowedRoles.includes(appUser.role)) {
    return (
      <div className="access-denied">
        <h2>Access denied</h2>
        <p>This page is not available for your account type.</p>
        <a href="/" className="btn-primary">Go home</a>
      </div>
    )
  }

  return children
}
