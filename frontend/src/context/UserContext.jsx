import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate, useLocation } from 'react-router-dom'
import api, { setAuthToken } from '../api'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const { isAuthenticated, getAccessTokenSilently, user, isLoading } = useAuth0()
  const [appUser, setAppUser] = useState(null)  // our DB user with role
  const [userLoading, setUserLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Auto-detect nearest supported timezone from browser
  const detectTimezone = () => {
    try {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (browserTz.includes('Kolkata') || browserTz.includes('Calcutta')) return 'Asia/Kolkata'
      if (browserTz.startsWith('America/')) return 'America/New_York'
      return 'Europe/London'
    } catch { return 'Europe/London' }
  }

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      setAppUser(null)
      setUserLoading(false)
      return
    }

    // Give the axios interceptor access to Auth0 tokens
    setAuthToken(getAccessTokenSilently)

    // Sync this Auth0 user with our backend
    const syncUser = async () => {
      try {
        const res = await api.post('/auth/sync', {
          auth0Id: user.sub,
          name: user.name,
          email: user.email,
          picture: user.picture,
          timezone: detectTimezone(),   // auto-detected; backend saves only if not already set
        })
        let appUserData = res.data

        // If the user has no role yet, check if there's a pre-selected role from the modal
        if (!appUserData.role) {
          const pendingRole = localStorage.getItem('pendingRole')
          if (pendingRole && ['patient', 'doctor'].includes(pendingRole)) {
            try {
              const roleRes = await api.post('/auth/set-role', { role: pendingRole })
              appUserData = roleRes.data
            } catch {
              // role setting failed, will fall through to /select-role
            }
          }
          localStorage.removeItem('pendingRole')
        }

        setAppUser(appUserData)

        // Redirect if landing on the root after Auth0 callback
        if (location.pathname === '/') {
          if (!appUserData.role) {
            navigate('/select-role')
          } else {
            navigate(appUserData.role === 'doctor' ? '/doctor' : '/dashboard')
          }
        }
      } catch (err) {
        console.error('Failed to sync user with backend', err)
      } finally {
        setUserLoading(false)
      }
    }

    syncUser()
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently])

  return (
    <UserContext.Provider value={{ appUser, setAppUser, userLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useAppUser = () => useContext(UserContext)
