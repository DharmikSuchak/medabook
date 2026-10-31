import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Attach the Auth0 token to every request
// Call setAuthToken(getAccessTokenSilently) once after login
let _getToken = null

export const setAuthToken = (fn) => {
  _getToken = fn
}

api.interceptors.request.use(async (config) => {
  if (_getToken) {
    try {
      const token = await _getToken()
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {
      // not logged in yet, proceed without token
    }
  }
  return config
})

export default api
