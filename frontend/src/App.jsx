import { Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import RoleSelect from './pages/RoleSelect'

// Dashboard placeholders — to be built next
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'

export default function App() {
  return (
    <UserProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        {/* Role picker — only shown from ProtectedRoute when role is missing */}
        <Route path="/select-role" element={<RoleSelect />} />

        {/* Protected patient routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected doctor routes */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </UserProvider>
  )
}
