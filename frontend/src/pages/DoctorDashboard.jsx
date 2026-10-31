import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useAppUser } from '../context/UserContext'
import api from '../api'

// ── Icons ──────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const icons = {
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    clock:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    users:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
    lock:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    logout:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    plus:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    check:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    globe:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    x:        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    edit:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    home:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    shield:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  }
  return icons[name] || null
}

// ── Timezone display helper ──
const TIMEZONES = ['Asia/Kolkata', 'Europe/London', 'America/New_York']
const TZ_LABELS = { 'Asia/Kolkata': 'IST', 'Europe/London': 'GMT/BST', 'America/New_York': 'ET' }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatInTz(utcStr, tz) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, hour: '2-digit', minute: '2-digit',
      day: '2-digit', month: 'short', year: 'numeric', hour12: true,
    }).format(new Date(utcStr))
  } catch { return utcStr }
}

function formatTimeOnly(utcStr, tz) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true,
    }).format(new Date(utcStr))
  } catch { return '' }
}

function formatDateOnly(utcStr, tz) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, weekday: 'short', day: '2-digit', month: 'short',
    }).format(new Date(utcStr))
  } catch { return '' }
}

// ── Status Badge ──
function Badge({ status }) {
  const map = {
    confirmed:   { bg: '#dcfce7', color: '#15803d', label: 'Confirmed' },
    cancelled:   { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
    rescheduled: { bg: '#fef3c7', color: '#b45309', label: 'Rescheduled' },
  }
  const s = map[status] || { bg: '#f1f5f9', color: '#64748b', label: status }
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
      {s.label}
    </span>
  )
}

// ── Toast ──
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  const bg = type === 'error' ? '#fee2e2' : '#dcfce7'
  const color = type === 'error' ? '#dc2626' : '#15803d'
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: bg, color, borderRadius: 12, padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', fontWeight: 600, fontSize: 14, display: 'flex', gap: 8, alignItems: 'center', maxWidth: 360 }}>
      <Icon name={type === 'error' ? 'x' : 'check'} size={16} />
      {msg}
    </div>
  )
}

// ── Skeleton ──
function Skeleton({ h = 20, w = '100%', r = 8 }) {
  return <div style={{ height: h, width: w, borderRadius: r, background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
}

// ── Stat Card ──
function StatCard({ label, value, icon, color = '#0ea5e9', sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 16, right: 16, opacity: 0.1, color }}><Icon name={icon} size={40} /></div>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 30, fontWeight: 700, color: '#1e293b' }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ── PROFILE MODAL ─────────────────────────────────────────────────────
function ProfileModal({ doctor, onClose, onSaved, showToast }) {
  const [name, setName] = useState(doctor?.name || '')
  const [specialization, setSpecialization] = useState(doctor?.specialization || '')
  const [bio, setBio] = useState(doctor?.bio || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const res = await api.put('/doctors/schedule', {
        workingHours: doctor?.workingHours || [],
        appointmentLength: doctor?.appointmentLength || 30,
        timezone: doctor?.timezone || 'Europe/London',
        name, specialization, bio,
      })
      onSaved(res.data)
      showToast('Profile updated!', 'success')
      onClose()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'modalIn 0.2s ease' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Edit Profile</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Update your professional details</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Avatar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, padding: 16, background: '#f0f9ff', borderRadius: 14, border: '1px solid #bae6fd' }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
            {doctor?.picture
              ? <img src={doctor.picture} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover' }} />
              : (doctor?.name || 'D')[0]
            }
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Dr. {doctor?.name?.split(' ')[0]}</div>
            <div style={{ fontSize: 12, color: '#0284c7', marginTop: 2 }}>{doctor?.email || ''}</div>
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Specialization</label>
            <input value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="e.g. Cardiologist" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Bio <span style={{ fontSize: 12, fontWeight: 400, color: '#94a3b8' }}>— shown to patients</span></label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Short bio visible to patients…" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 0', background: saving ? '#94a3b8' : '#0284c7', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>
            <Icon name="check" size={16} /> {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}


// ── TZ SWITCHER ───────────────────────────────────────────────────────
function TzSwitcher({ currentTz, onChangeTz }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const zones = [
    { tz: 'Asia/Kolkata',      label: 'IST',     flag: '🇮🇳', full: 'India Standard Time' },
    { tz: 'Europe/London',     label: 'GMT/BST',  flag: '🇬🇧', full: 'London / GMT' },
    { tz: 'America/New_York',  label: 'ET',       flag: '🇺🇸', full: 'Eastern Time' },
  ]
  const active = zones.find(z => z.tz === currentTz) || zones[0]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: open ? '#f0f9ff' : '#f8fafc',
        border: `1.5px solid ${open ? '#bae6fd' : '#e2e8f0'}`,
        borderRadius: 10, padding: '5px 10px', cursor: 'pointer',
        fontSize: 13, fontWeight: 700, color: '#0284c7',
        transition: 'all 0.15s',
      }}>
        <span style={{ fontSize: 15 }}>{active.flag}</span>
        <span>{active.label}</span>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
          background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
          border: '1px solid #e2e8f0', padding: 6, minWidth: 220,
          animation: 'tzIn 0.15s ease',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 10px 6px' }}>Your Timezone</div>
          {zones.map(z => {
            const isCur = z.tz === currentTz
            const now = new Intl.DateTimeFormat('en-GB', { timeZone: z.tz, hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date())
            return (
              <button key={z.tz} onClick={() => { onChangeTz(z.tz); setOpen(false) }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, border: 'none',
                background: isCur ? '#f0f9ff' : 'transparent',
                cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left',
              }}
                onMouseEnter={e => { if (!isCur) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { if (!isCur) e.currentTarget.style.background = 'transparent' }}>
                <span style={{ fontSize: 18 }}>{z.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: isCur ? 700 : 600, color: isCur ? '#0284c7' : '#1e293b' }}>{z.full}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{now}</div>
                </div>
                {isCur && (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── SIDEBAR ──────────────────────────────────────────────────────────
function Sidebar({ active, setActive, doctor, onLogout, onOpenProfile }) {
  const nav = [
    { id: 'overview',     label: 'Overview',     icon: 'home' },
    { id: 'appointments', label: 'My Bookings',  icon: 'calendar' },
    { id: 'schedule',     label: 'Schedule',     icon: 'clock' },
    { id: 'blocked',      label: 'Blocked Time', icon: 'lock' },
  ]

  return (
    <aside style={{ width: 240, minHeight: '100vh', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 100 }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="shield" size={16} />
          </div>
          <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>MedaBook</span>
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, marginLeft: 40, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Doctor Portal</div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 8, paddingLeft: 8 }}>Menu</div>
        {nav.map(item => {
          const isActive = active === item.id
          return (
            <button key={item.id} onClick={() => setActive(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 999, border: 'none', background: isActive ? 'rgba(14,165,233,0.1)' : 'transparent', color: isActive ? '#0369a1' : '#64748b', fontWeight: isActive ? 700 : 500, fontSize: 14, cursor: 'pointer', marginBottom: 2, transition: 'all 0.15s', position: 'relative' }}>
              <Icon name={item.icon} size={18} />
              {item.label}
              {isActive && <span style={{ position: 'absolute', right: 10, width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9' }} />}
            </button>
          )
        })}
      </nav>

      {/* User card — click to edit profile */}
      <div style={{ padding: 12, borderTop: '1px solid #e2e8f0' }}>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, background: 'rgba(255,255,255,0.8)' }}>
          <button
            onClick={onOpenProfile}
            title="Edit profile"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 10, borderRadius: 8, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {doctor?.picture
              ? <img src={doctor.picture} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{(doctor?.name || 'D')[0]}</div>
            }
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>Dr. {doctor?.name?.split(' ')[0]}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{doctor?.specialization || 'General'}</div>
            </div>
            <Icon name="edit" size={14} />
          </button>
          <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Icon name="logout" size={14} /> Log out
          </button>
        </div>
      </div>
    </aside>
  )
}

// ── OVERVIEW TAB ─────────────────────────────────────────────────────
function OverviewTab({ doctor, appointments }) {
  const tz = doctor?.timezone || 'Europe/London'
  const now = new Date()

  const todayAppts = appointments.filter(a => {
    if (a.status !== 'confirmed') return false
    const d = new Date(a.startUtc)
    return d.toDateString() === now.toDateString()
  })
  const upcoming = appointments.filter(a => a.status === 'confirmed' && new Date(a.startUtc) > now)
  const totalPatients = new Set(appointments.filter(a => a.status === 'confirmed').map(a => a.patient?._id)).size

  return (
    <div>
      <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, Dr. {doctor?.name?.split(' ')[0]} 👋</h1>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 28px' }}>
        {new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)} · {TZ_LABELS[tz]}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatCard label="Today's Appointments" value={todayAppts.length} icon="calendar" color="#0ea5e9" sub={todayAppts.length === 0 ? 'No appointments today' : `Next: ${todayAppts[0] ? formatTimeOnly(todayAppts[0].startUtc, tz) : '—'}`} />
        <StatCard label="Upcoming Bookings" value={upcoming.length} icon="activity" color="#6366f1" sub="Next 30 days" />
        <StatCard label="Total Patients" value={totalPatients} icon="users" color="#10b981" sub="All time" />
      </div>

      {/* Today's schedule */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>Today's Schedule</h2>
          <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{TZ_LABELS[tz]}</span>
        </div>
        {todayAppts.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
            <Icon name="calendar" size={40} />
            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '12px 0 4px' }}>No appointments today</p>
            <p style={{ fontSize: 14, margin: 0 }}>Enjoy your free day or update your schedule.</p>
          </div>
        ) : (
          <div>
            {todayAppts.map((a, i) => (
              <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: i < todayAppts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ textAlign: 'center', minWidth: 56 }}>
                  <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 16, fontWeight: 700, color: '#0ea5e9' }}>{formatTimeOnly(a.startUtc, tz)}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{doctor?.appointmentLength || 30}min</div>
                </div>
                <div style={{ width: 1, height: 36, background: '#e2e8f0' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{a.patient?.name || 'Patient'}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{a.patient?.email} · {TZ_LABELS[a.patientTimezone]}</div>
                </div>
                <Badge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── APPOINTMENTS TAB ──────────────────────────────────────────────────
function AppointmentsTab({ appointments, doctorTz, loading }) {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>My Bookings</h1>
        <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
          {['all', 'confirmed', 'cancelled', 'rescheduled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: filter === s ? '#fff' : 'transparent', color: filter === s ? '#0f172a' : '#64748b', fontWeight: filter === s ? 700 : 500, fontSize: 13, cursor: 'pointer', boxShadow: filter === s ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s', textTransform: 'capitalize' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.4fr 1fr 0.8fr', padding: '12px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          {['Patient', 'Date (Your Time)', 'Patient Local Time', 'Duration', 'Status'].map(h => (
            <div key={h} style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <Skeleton key={i} h={40} r={8} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
            <Icon name="calendar" size={36} />
            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '12px 0 4px' }}>No appointments found</p>
            <p style={{ fontSize: 14, margin: 0 }}>When patients book slots, they'll appear here.</p>
          </div>
        ) : (
          filtered.map((a, i) => (
            <div key={a._id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.4fr 1fr 0.8fr', padding: '14px 24px', borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none', alignItems: 'center' }}>
              {/* Patient */}
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{a.patient?.name || '—'}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{a.patient?.email}</div>
              </div>
              {/* Doctor local time */}
              <div>
                <div style={{ fontWeight: 500, color: '#334155', fontSize: 14 }}>{formatTimeOnly(a.startUtc, doctorTz)}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{formatDateOnly(a.startUtc, doctorTz)}</div>
              </div>
              {/* Patient local time */}
              <div>
                <div style={{ fontWeight: 500, color: '#334155', fontSize: 14 }}>{formatTimeOnly(a.startUtc, a.patientTimezone)}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{formatDateOnly(a.startUtc, a.patientTimezone)} · {TZ_LABELS[a.patientTimezone]}</div>
              </div>
              {/* Duration */}
              <div style={{ fontSize: 14, color: '#334155' }}>
                {Math.round((new Date(a.endUtc) - new Date(a.startUtc)) / 60000)} min
              </div>
              {/* Status */}
              <div><Badge status={a.status} /></div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── TIME RANGE PICKER ────────────────────────────────────────────────
const HOURS = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i).padStart(2, '0'))
const MINS  = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

function parseTime(val) {
  const [h, m] = (val || '09:00').split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  const roundedMin = String(Math.round(m / 5) * 5 % 60).padStart(2, '0')
  return { hour: String(hour12).padStart(2, '0'), min: roundedMin, period }
}

function buildTime(hour, min, period) {
  let h = Number(hour)
  if (period === 'AM') { if (h === 12) h = 0 }
  else { if (h !== 12) h += 12 }
  return `${String(h).padStart(2, '0')}:${min}`
}

const tSelStyle = {
  padding: '7px 6px', border: '1.5px solid #e2e8f0', borderRadius: 8,
  fontSize: 13, fontWeight: 600, color: '#0f172a', background: '#f8fafc',
  outline: 'none', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
  fontFamily: 'Inter,sans-serif', textAlign: 'center',
}

function TimeRangePicker({ start, end, onStartChange, onEndChange }) {
  const s = parseTime(start)
  const e = parseTime(end)

  const handleStart = (field, val) => {
    const updated = { ...s, [field]: val }
    onStartChange(buildTime(updated.hour, updated.min, updated.period))
  }
  const handleEnd = (field, val) => {
    const updated = { ...e, [field]: val }
    onEndChange(buildTime(updated.hour, updated.min, updated.period))
  }

  const pickerBox = (parsed, onChange) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '4px 8px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <select value={parsed.hour} onChange={e => onChange('hour', e.target.value)} style={{ ...tSelStyle, width: 40, background: 'transparent', border: 'none', boxShadow: 'none', padding: '6px 2px' }}>
        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: 15, lineHeight: 1 }}>:</span>
      <select value={parsed.min} onChange={e => onChange('min', e.target.value)} style={{ ...tSelStyle, width: 40, background: 'transparent', border: 'none', boxShadow: 'none', padding: '6px 2px' }}>
        {MINS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select value={parsed.period} onChange={e => onChange('period', e.target.value)} style={{ ...tSelStyle, width: 44, background: '#f0f9ff', border: 'none', boxShadow: 'none', borderRadius: 6, color: '#0284c7', padding: '6px 2px' }}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {pickerBox(s, handleStart)}
      <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: 16 }}>→</span>
      {pickerBox(e, handleEnd)}
    </div>
  )
}

// ── SCHEDULE TAB ─────────────────────────────────────────────────────
function ScheduleTab({ doctor, onSaved, showToast }) {
  const [apptLen, setApptLen] = useState(doctor?.appointmentLength || 30)
  const [timezone, setTimezone] = useState(doctor?.timezone || 'Europe/London')
  const [specialization, setSpecialization] = useState(doctor?.specialization || '')
  const [bio, setBio] = useState(doctor?.bio || '')
  const [saving, setSaving] = useState(false)

  // Working hours: array of { day: 0-6, ranges: [{start,end}] }
  const initHours = () => {
    const defaults = {}
    for (let d = 0; d < 7; d++) {
      const existing = doctor?.workingHours?.find(w => w.day === d)
      defaults[d] = existing ? { enabled: true, ranges: existing.ranges.map(r => ({ ...r })) } : { enabled: false, ranges: [{ start: '09:00', end: '17:00' }] }
    }
    return defaults
  }
  const [hours, setHours] = useState(initHours)

  const toggleDay = (d) => setHours(h => ({ ...h, [d]: { ...h[d], enabled: !h[d].enabled } }))
  const updateRange = (d, i, field, val) => setHours(h => {
    const ranges = h[d].ranges.map((r, ri) => ri === i ? { ...r, [field]: val } : r)
    return { ...h, [d]: { ...h[d], ranges } }
  })
  const addRange = (d) => setHours(h => ({ ...h, [d]: { ...h[d], ranges: [...h[d].ranges, { start: '09:00', end: '17:00' }] } }))
  const removeRange = (d, i) => setHours(h => ({ ...h, [d]: { ...h[d], ranges: h[d].ranges.filter((_, ri) => ri !== i) } }))

  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const save = async () => {
    // ── Validate ranges ──
    for (let d = 0; d < 7; d++) {
      if (!hours[d].enabled) continue
      const ranges = hours[d].ranges
      for (let ri = 0; ri < ranges.length; ri++) {
        const s = toMinutes(ranges[ri].start)
        const e = toMinutes(ranges[ri].end)
        if (s >= e) {
          return showToast(`${DAY_FULL[d]}: start time must be before end time (range ${ri + 1})`, 'error')
        }
        // Check overlap with later ranges
        for (let rj = ri + 1; rj < ranges.length; rj++) {
          const s2 = toMinutes(ranges[rj].start)
          const e2 = toMinutes(ranges[rj].end)
          if (s < e2 && e > s2) {
            return showToast(`${DAY_FULL[d]}: time ranges ${ri + 1} and ${rj + 1} overlap`, 'error')
          }
        }
      }
    }

    setSaving(true)
    try {
      const workingHours = Object.entries(hours)
        .filter(([, v]) => v.enabled && v.ranges.length > 0)
        .map(([d, v]) => ({ day: Number(d), ranges: v.ranges }))

      const res = await api.put('/doctors/schedule', { workingHours, appointmentLength: apptLen, specialization, bio, timezone })
      onSaved(res.data)
      showToast('Schedule saved successfully!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save schedule', 'error')
    } finally {
      setSaving(false)
    }
  }


  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>Schedule & Profile</h1>
        <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: saving ? '#94a3b8' : '#0284c7', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
          <Icon name="check" size={16} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        {/* Working hours */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', padding: 24 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Working Hours</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>Set your available days and time ranges in your local timezone ({TZ_LABELS[timezone]})</p>
          {[0,1,2,3,4,5,6].map(d => (
            <div key={d} style={{ marginBottom: 4, paddingBottom: 16, borderBottom: d < 6 ? '1px solid #f1f5f9' : 'none', minHeight: 52 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: hours[d].enabled ? 10 : 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={hours[d].enabled} onChange={() => toggleDay(d)} style={{ width: 16, height: 16, accentColor: '#0284c7', cursor: 'pointer' }} />
                  <span style={{ fontWeight: 700, color: hours[d].enabled ? '#1e293b' : '#94a3b8', fontSize: 14, width: 32 }}>{DAYS[d]}</span>
                  <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>{DAY_FULL[d]}</span>
                </label>
                {hours[d].enabled && (
                  <button onClick={() => addRange(d)} style={{ marginLeft: 'auto', background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0284c7', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="plus" size={12} /> Add range
                  </button>
                )}
              </div>
              {hours[d].enabled && hours[d].ranges.map((r, ri) => (
                <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 24, marginBottom: 8 }}>
                  <TimeRangePicker
                    start={r.start}
                    end={r.end}
                    onStartChange={val => updateRange(d, ri, 'start', val)}
                    onEndChange={val => updateRange(d, ri, 'end', val)}
                  />
                  {hours[d].ranges.length > 1 && (
                    <button onClick={() => removeRange(d, ri)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <Icon name="trash" size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Appointment length */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', padding: 24 }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Appointment Length</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>Duration of each consultation slot</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[15, 30, 60].map(len => (
                <button key={len} onClick={() => setApptLen(len)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: apptLen === len ? '2px solid #0284c7' : '2px solid #e2e8f0', background: apptLen === len ? '#f0f9ff' : '#fff', color: apptLen === len ? '#0284c7' : '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {len} min
                </button>
              ))}
            </div>
          </div>

          {/* Timezone */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', padding: 24 }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Your Timezone</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>Working hours are defined in this timezone</p>
            <select value={timezone} onChange={e => setTimezone(e.target.value)} style={selectStyle}>
              {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz} ({TZ_LABELS[tz]})</option>)}
            </select>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── BLOCKED TIME TAB ─────────────────────────────────────────────────
function BlockedTab({ doctor, onSaved, showToast }) {
  const [blocks, setBlocks] = useState(doctor?.blockedPeriods || [])
  const [form, setForm] = useState({ start: '', end: '', reason: '' })
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(null)
  const tz = doctor?.timezone || 'Europe/London'

  useEffect(() => { setBlocks(doctor?.blockedPeriods || []) }, [doctor])

  const addBlock = async () => {
    if (!form.start || !form.end) return showToast('Start and end are required', 'error')
    if (new Date(form.start) >= new Date(form.end)) return showToast('End must be after start', 'error')
    setSaving(true)
    try {
      const res = await api.post('/doctors/block', { ...form, timezone: tz })
      onSaved(res.data)
      setBlocks(res.data.blockedPeriods)
      setForm({ start: '', end: '', reason: '' })
      showToast('Blocked period added', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add block', 'error')
    } finally { setSaving(false) }
  }

  const removeBlock = async (blockId) => {
    setRemoving(blockId)
    try {
      const res = await api.delete(`/doctors/block/${blockId}`)
      onSaved(res.data.doctor)
      setBlocks(res.data.doctor.blockedPeriods)
      showToast('Blocked period removed', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove block', 'error')
    } finally { setRemoving(null) }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 700, color: '#1e293b', margin: '0 0 24px' }}>Blocked Time</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        {/* Add block form */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', padding: 24 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Block a Period</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
            Block breaks, holidays, or unavailable time. Times are in your active timezone (<strong>{TZ_LABELS[tz] || tz}</strong>) — patients won't see these slots.
          </p>

          <label style={labelStyle}>Start ({TZ_LABELS[tz] || tz})</label>
          <input type="datetime-local" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} style={inputStyle} />

          <label style={{ ...labelStyle, marginTop: 12 }}>End ({TZ_LABELS[tz] || tz})</label>
          <input type="datetime-local" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} style={inputStyle} />

          <label style={{ ...labelStyle, marginTop: 12 }}>Reason (optional)</label>
          <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Lunch break, Holiday…" style={inputStyle} />

          <button onClick={addBlock} disabled={saving} style={{ marginTop: 16, width: '100%', padding: '11px 0', background: saving ? '#94a3b8' : '#0284c7', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="plus" size={16} /> {saving ? 'Adding…' : 'Block This Time'}
          </button>
        </div>

        {/* Existing blocks */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>Active Blocks</h2>
          </div>
          {blocks.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#94a3b8' }}>
              <Icon name="lock" size={36} />
              <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '12px 0 4px' }}>No blocked periods</p>
              <p style={{ fontSize: 14, margin: 0 }}>All your working hours are open for booking.</p>
            </div>
          ) : (
            blocks.map((b, i) => (
              <div key={b._id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderBottom: i < blocks.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{b.reason || 'Blocked'}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{formatInTz(b.start, tz)} → {formatInTz(b.end, tz)}</span>
                    <span style={{ background: '#f1f5f9', color: '#0369a1', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>{TZ_LABELS[tz] || tz}</span>
                  </div>
                </div>
                <span style={{ background: '#fee2e2', color: '#dc2626', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>Blocked</span>
                <button onClick={() => removeBlock(b._id)} disabled={removing === b._id} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: removing === b._id ? 0.5 : 1 }}>
                  <Icon name="trash" size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter,sans-serif' }
const selectStyle = { ...inputStyle }
const labelStyle  = { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }
const timeInputStyle = { padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none', fontFamily: 'Inter,sans-serif' }

// ── MAIN COMPONENT ────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const { appUser, setAppUser } = useAppUser()
  const { logout } = useAuth0()
  const [active, setActive]   = useState('overview')
  const [appointments, setAppointments] = useState([])
  const [loadingAppts, setLoadingAppts] = useState(true)
  const [toast, setToast] = useState(null)
  const [doctor, setDoctor] = useState(appUser)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    if (appUser) setDoctor(appUser)
  }, [appUser])

  const handleTzChange = async (newTz) => {
    try {
      const res = await api.put('/auth/profile', { timezone: newTz })
      handleSaved(res.data)
      showToast(`Timezone changed to ${newTz}`, 'success')
    } catch { showToast('Failed to update timezone', 'error') }
  }

  const showToast = useCallback((msg, type = 'success') => setToast({ msg, type }), [])

  const fetchAppointments = useCallback(async () => {
    setLoadingAppts(true)
    try {
      const res = await api.get('/doctors/me/appointments')
      setAppointments(res.data)
    } catch (err) {
      showToast('Failed to load appointments', 'error')
    } finally {
      setLoadingAppts(false)
    }
  }, [showToast])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const handleSaved = (updated) => {
    setDoctor(updated)
    setAppUser(updated)
  }

  const handleLogout = () => logout({ logoutParams: { returnTo: window.location.origin } })

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;700;800&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                @keyframes tzIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: #0ea5e9 !important; box-shadow: 0 0 0 3px rgba(14,165,233,0.1) !important; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.45); border-radius: 4px; }
      `}</style>

      <Sidebar active={active} setActive={setActive} doctor={doctor} onLogout={handleLogout} onOpenProfile={() => setShowProfile(true)} />

      {/* Main */}
      <main style={{ marginLeft: 240, padding: 32, minHeight: '100vh' }}>
        {/* Sticky header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(248,250,252,0.85)', backdropFilter: 'blur(12px)', padding: '12px 0', marginBottom: 24, borderBottom: '1px solid rgba(226,232,240,0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
              🟢 Doctor
            </span>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {new Intl.DateTimeFormat('en-GB', { timeZone: doctor?.timezone || 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: true, day: 'numeric', month: 'short' }).format(new Date())}
            </span>
            <TzSwitcher currentTz={doctor?.timezone || 'Europe/London'} onChangeTz={handleTzChange} />
            <button onClick={fetchAppointments} title="Refresh" style={{ marginLeft: 'auto', background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#64748b', fontSize: 12, fontWeight: 600 }}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {active === 'overview'     && <OverviewTab doctor={doctor} appointments={appointments} />}
        {active === 'appointments' && <AppointmentsTab appointments={appointments} doctorTz={doctor?.timezone || 'Europe/London'} loading={loadingAppts} />}
        {active === 'schedule'     && <ScheduleTab doctor={doctor} onSaved={handleSaved} showToast={showToast} />}
        {active === 'blocked'      && <BlockedTab  doctor={doctor} onSaved={handleSaved} showToast={showToast} />}
      </main>

      {showProfile && (
        <ProfileModal
          doctor={doctor}
          onClose={() => setShowProfile(false)}
          onSaved={handleSaved}
          showToast={showToast}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
