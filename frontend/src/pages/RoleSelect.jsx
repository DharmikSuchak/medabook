import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useAppUser } from '../context/UserContext'
import api from '../api'

export default function RoleSelect() {
  const { user } = useAuth0()
  const { setAppUser } = useAppUser()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const confirm = async () => {
    if (!selected) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/set-role', { role: selected })
      setAppUser(res.data)
      navigate(res.data.role === 'doctor' ? '/doctor' : '/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="role-select-page">
      {/* Background blobs */}
      <div className="hero-blobs" aria-hidden="true">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
      </div>

      <div className="role-select-card">
        <div className="role-select-avatar">
          {user?.picture
            ? <img src={user.picture} alt={user.name} />
            : <span>{user?.name?.[0] ?? '?'}</span>
          }
        </div>

        <h1 className="role-select-greeting">
          Welcome, {user?.name?.split(' ')[0]}
        </h1>
        <p className="role-select-sub">
          How will you be using MedaBook? You can only pick once.
        </p>

        <div className="role-select-options">
          <button
            id="role-patient-btn"
            className={`role-option${selected === 'patient' ? ' active' : ''}`}
            onClick={() => setSelected('patient')}
            aria-pressed={selected === 'patient'}
          >
            <div className="role-option-icon">👤</div>
            <div className="role-option-label">I am a Patient</div>
            <div className="role-option-desc">
              Browse doctors, book appointments, manage my schedule
            </div>
          </button>

          <button
            id="role-doctor-btn"
            className={`role-option${selected === 'doctor' ? ' active' : ''}`}
            onClick={() => setSelected('doctor')}
            aria-pressed={selected === 'doctor'}
          >
            <div className="role-option-icon">🩺</div>
            <div className="role-option-label">I am a Doctor</div>
            <div className="role-option-desc">
              Set my schedule, manage availability, view my bookings
            </div>
          </button>
        </div>

        {error && <p className="role-select-error">{error}</p>}

        <button
          id="role-confirm-btn"
          className="btn-primary role-select-confirm"
          onClick={confirm}
          disabled={!selected || loading}
        >
          {loading ? 'Setting up your account…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
