import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useAppUser } from '../context/UserContext'
import api from '../api'

// ── Icons ──────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const icons = {
    search:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    clock:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    user:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    logout:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    check:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    x:        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    home:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    stethoscope: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><circle cx="19" cy="17" r="2"/><path d="M16 17h-4"/></svg>,
    globe:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    refresh:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
    chevronLeft:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
    chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
    shield:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    edit:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
    video:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
    lock:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    arrowRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  }
  return icons[name] || null
}

// ── Constants ─────────────────────────────────────────────────────────
const TIMEZONES = ['Asia/Kolkata', 'Europe/London', 'America/New_York']
const TZ_LABELS  = { 'Asia/Kolkata': 'IST', 'Europe/London': 'GMT/BST', 'America/New_York': 'ET' }

// ── Helpers ───────────────────────────────────────────────────────────
const fmtTime = (utcStr, tz) => {
  try { return new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(utcStr)) }
  catch { return '' }
}
const fmtDate = (utcStr, tz) => {
  try { return new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(utcStr)) }
  catch { return '' }
}
const fmtFull = (utcStr, tz) => `${fmtTime(utcStr, tz)}, ${fmtDate(utcStr, tz)}`
const hoursUntil = (utcStr) => (new Date(utcStr) - Date.now()) / 3600000
const formatDoctorName = (name) => {
  if (!name) return 'Doctor'
  const trimmed = name.trim()
  return /^dr\.?\s+/i.test(trimmed) ? trimmed : `Dr. ${trimmed}`
}

const getDateParts = (utcStr, tz) => {
  try {
    const d = new Date(utcStr)
    const month = new Intl.DateTimeFormat('en-GB', { timeZone: tz, month: 'short' }).format(d).toUpperCase()
    const day = new Intl.DateTimeFormat('en-GB', { timeZone: tz, day: '2-digit' }).format(d)
    const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short' }).format(d).toUpperCase()
    const fullDate = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d)
    return { month, day, weekday, fullDate }
  } catch {
    return { month: '—', day: '—', weekday: '—', fullDate: '' }
  }
}

const getUrgencyLabel = (utcStr) => {
  const diffHours = (new Date(utcStr) - Date.now()) / 3600000
  if (diffHours < 0) return null
  if (diffHours <= 2) {
    const mins = Math.max(1, Math.round(diffHours * 60))
    return { text: `Starting in ~${mins}m`, urgent: true }
  }
  if (diffHours <= 24) {
    return { text: 'Today', urgent: false }
  }
  if (diffHours <= 48) {
    return { text: 'Tomorrow', urgent: false }
  }
  const days = Math.round(diffHours / 24)
  return { text: `In ${days}d`, urgent: false }
}

// ── Toast ─────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: type === 'error' ? '#fee2e2' : '#dcfce7', color: type === 'error' ? '#dc2626' : '#15803d', borderRadius: 12, padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', fontWeight: 600, fontSize: 14, display: 'flex', gap: 8, alignItems: 'center', maxWidth: 380, animation: 'slideUp 0.25s ease' }}>
      <Icon name={type === 'error' ? 'x' : 'check'} size={16} />
      {msg}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────
function Badge({ status }) {
  const m = {
    confirmed:   ['#ecfdf5', '#047857', '#10b981', 'Confirmed'],
    cancelled:   ['#fff1f2', '#be123c', '#f43f5e', 'Cancelled'],
    rescheduled: ['#fffbeb', '#b45309', '#f59e0b', 'Rescheduled'],
  }
  const [bg, color, dotColor, label] = m[status] || ['#f1f5f9', '#475569', '#94a3b8', status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: bg, color, borderRadius: 999, padding: '3px 12px', fontSize: 12, fontWeight: 700, border: `1px solid ${status === 'confirmed' ? '#a7f3d0' : status === 'cancelled' ? '#fecdd3' : '#fde68a'}` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, boxShadow: status === 'confirmed' ? '0 0 6px #10b981' : 'none' }} />
      {label}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────
function Sk({ h = 20, w = '100%', r = 8 }) {
  return <div style={{ height: h, width: w, borderRadius: r, background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
}

// ── StatCard ──────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color = '#0ea5e9', sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 16, right: 16, opacity: 0.1, color }}><Icon name={icon} size={40} /></div>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 30, fontWeight: 700, color: '#1e293b' }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ── SIDEBAR ───────────────────────────────────────────────────────────
function Sidebar({ active, setActive, patient, onLogout, onOpenProfile }) {
  const nav = [
    { id: 'overview',    label: 'Overview',       icon: 'home' },
    { id: 'browse',      label: 'Find Doctors',   icon: 'stethoscope' },
    { id: 'appointments',label: 'My Appointments',icon: 'calendar' },
  ]
  return (
    <aside style={{ width: 240, minHeight: '100vh', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 100 }}>
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="shield" size={16} /></div>
          <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#0f172a' }}>MedaBook</span>
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, marginLeft: 40, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Patient Portal</div>
      </div>
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 8, paddingLeft: 8 }}>Menu</div>
        {nav.map(item => {
          const on = active === item.id
          return (
            <button key={item.id} onClick={() => setActive(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 999, border: 'none', background: on ? 'rgba(14,165,233,0.1)' : 'transparent', color: on ? '#0369a1' : '#64748b', fontWeight: on ? 700 : 500, fontSize: 14, cursor: 'pointer', marginBottom: 2, transition: 'all 0.15s', position: 'relative' }}>
              <Icon name={item.icon} size={18} />
              {item.label}
              {on && <span style={{ position: 'absolute', right: 10, width: 6, height: 6, borderRadius: '50%', background: '#0ea5e9' }} />}
            </button>
          )
        })}
      </nav>
      <div style={{ padding: 12, borderTop: '1px solid #e2e8f0' }}>
        <div style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12 }}>
          <button onClick={onOpenProfile} title="Edit profile"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', borderRadius: 8, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            {patient?.picture
              ? <img src={patient.picture} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 32, height: 32, borderRadius: 8, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{(patient?.name || 'P')[0]}</div>
            }
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{patient?.name?.split(' ')[0]}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{TZ_LABELS[patient?.timezone] || 'Patient'}</div>
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

// ── OVERVIEW TAB ──────────────────────────────────────────────────────
function OverviewTab({ patient, appointments, onNavigate }) {
  const tz = patient?.timezone || 'Asia/Kolkata'
  const now = new Date()
  const upcoming = appointments.filter(a => a.status === 'confirmed' && new Date(a.startUtc) > now).slice(0, 3)
  const total = appointments.length
  const cancelled = appointments.filter(a => a.status === 'cancelled').length

  const nextAppt = upcoming[0]

  return (
    <div>
      <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>
        Welcome back, {patient?.name?.split(' ')[0]} 👋
      </h1>
      <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 28px' }}>
        {new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long' }).format(now)} · {TZ_LABELS[tz]}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
        <StatCard label="Upcoming" value={upcoming.length} icon="calendar" color="#0ea5e9" sub={nextAppt ? `Next: ${fmtTime(nextAppt.startUtc, tz)}` : 'No upcoming'} />
        <StatCard label="Total Booked" value={total} icon="activity" color="#6366f1" sub="All time" />
        <StatCard label="Cancelled" value={cancelled} icon="x" color="#ef4444" sub="All time" />
      </div>

      {/* Next appointment card */}
      {nextAppt ? (
        <div style={{ background: 'linear-gradient(135deg,#0284c7,#0ea5e9)', borderRadius: 16, padding: 24, marginBottom: 24, color: '#fff' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.8, marginBottom: 8 }}>Next Appointment</div>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {formatDoctorName(nextAppt.doctor?.name)}
          </div>
          <div style={{ opacity: 0.9, fontSize: 14, marginBottom: 12 }}>{nextAppt.doctor?.specialization}</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              ['Asia/Kolkata', 'IST'], ['Europe/London', 'GMT/BST'], ['America/New_York', 'ET']
            ].map(([zone, label]) => (
              <div key={zone}>
                <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600 }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{fmtTime(nextAppt.startUtc, zone)}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{fmtDate(nextAppt.startUtc, zone)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', padding: '40px 24px', textAlign: 'center', marginBottom: 24 }}>
          <Icon name="stethoscope" size={40} />
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '12px 0 6px' }}>No upcoming appointments</p>
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px' }}>Find a doctor and book your first appointment.</p>
          <button onClick={() => onNavigate('browse')} style={{ padding: '10px 28px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Find a Doctor →
          </button>
        </div>
      )}

      {/* Recent appointments */}
      {appointments.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>Recent Activity</h2>
            <button onClick={() => onNavigate('appointments')} style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>View all →</button>
          </div>
          {appointments.slice(0, 4).map((a, i, arr) => (
            <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}><Icon name="stethoscope" size={18} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{formatDoctorName(a.doctor?.name)}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{fmtFull(a.startUtc, tz)}</div>
              </div>
              <Badge status={a.status} />
            </div>
          ))}
        </div>
      )}
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
        background: open ? '#f0fdf4' : '#f8fafc',
        border: `1.5px solid ${open ? '#86efac' : '#e2e8f0'}`,
        borderRadius: 10, padding: '5px 10px', cursor: 'pointer',
        fontSize: 13, fontWeight: 700, color: '#15803d',
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
                background: isCur ? '#f0fdf4' : 'transparent',
                cursor: 'pointer', transition: 'background 0.12s', textAlign: 'left',
              }}
                onMouseEnter={e => { if (!isCur) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { if (!isCur) e.currentTarget.style.background = 'transparent' }}>
                <span style={{ fontSize: 18 }}>{z.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: isCur ? 700 : 600, color: isCur ? '#15803d' : '#1e293b' }}>{z.full}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{now}</div>
                </div>
                {isCur && (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

// ── RICH CALENDAR ────────────────────────────────────────────────────
const CAL_DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']
const CAL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function RichCalendar({ value, min, onChange }) {
  const today    = new Date()
  const todayStr = today.toISOString().slice(0,10)
  const minDate  = min ? new Date(min + 'T00:00:00') : today

  const initView = () => {
    const d = value ? new Date(value + 'T00:00:00') : today
    return { year: d.getFullYear(), month: d.getMonth() }
  }
  const [view, setView] = useState(initView)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const prevMonth = () => setView(v => v.month === 0 ? { year: v.year-1, month: 11 } : { ...v, month: v.month-1 })
  const nextMonth = () => setView(v => v.month === 11 ? { year: v.year+1, month: 0 } : { ...v, month: v.month+1 })

  const getDays = () => {
    const first = new Date(view.year, view.month, 1).getDay()
    const total = new Date(view.year, view.month + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < first; i++) cells.push(null)
    for (let d = 1; d <= total; d++) cells.push(d)
    return cells
  }

  const toStr = (d) => `${view.year}-${String(view.month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  const isDisabled = (d) => d && new Date(toStr(d) + 'T00:00:00') < minDate

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Select a date'

  return (
    <div ref={wrapRef} style={{ position: 'relative', userSelect: 'none' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: `1.5px solid ${open ? '#0ea5e9' : '#e2e8f0'}`, borderRadius: 10, background: '#fff', cursor: 'pointer', fontSize: 14, color: value ? '#0f172a' : '#94a3b8', fontWeight: value ? 600 : 400, fontFamily: 'Inter,sans-serif', boxShadow: open ? '0 0 0 3px rgba(14,165,233,0.1)' : 'none', transition: 'all 0.15s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="calendar" size={16} />{displayValue}</div>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 280, width: 280, zIndex: 1000, background: '#fff', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.18)', border: '1px solid #e2e8f0', padding: '16px', animation: 'calIn 0.18s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <button onClick={prevMonth} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <Icon name="chevronLeft" size={16} />
            </button>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: '#0f172a', fontSize: 15 }}>
              {CAL_MONTHS[view.month]} {view.year}
            </span>
            <button onClick={nextMonth} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <Icon name="chevronRight" size={16} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 6 }}>
            {CAL_DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94a3b8', padding: '3px 0' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
            {getDays().map((d, i) => {
              if (!d) return <div key={`e${i}`} />
              const str      = toStr(d)
              const disabled = isDisabled(d)
              const isToday  = str === todayStr
              const isSel    = str === value
              return (
                <button key={str} onClick={() => { if (!disabled) { onChange(str); setOpen(false) } }} style={{
                  width: '100%', aspectRatio: '1', border: 'none', borderRadius: 8,
                  cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 13,
                  fontWeight: isSel ? 700 : isToday ? 700 : 400,
                  background: isSel ? '#0284c7' : isToday ? '#f0f9ff' : 'transparent',
                  color: isSel ? '#fff' : disabled ? '#cbd5e1' : isToday ? '#0284c7' : '#1e293b',
                  outline: isToday && !isSel ? '1.5px solid #bae6fd' : 'none',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => { if (!disabled && !isSel) e.currentTarget.style.background = '#f0f9ff' }}
                  onMouseLeave={e => { if (!disabled && !isSel) e.currentTarget.style.background = 'transparent' }}>
                  {d}
                </button>
              )
            })}
          </div>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <button onClick={() => { onChange(todayStr); setView({ year: today.getFullYear(), month: today.getMonth() }); setOpen(false) }}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Today</button>
          </div>
        </div>
      )}
    </div>
  )
}


// ── BOOKING CONFIRMATION MODAL ─────────────────────────────────────────
function BookingSuccessModal({ booking, onClose, onGoToAppointments, tz }) {
  if (!booking) return null

  const { doctor, slot } = booking
  const docName = formatDoctorName(doctor?.name)

  const dateStr = slot?.startUtc
    ? new Date(slot.startUtc).toLocaleDateString('en-GB', {
        timeZone: tz,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : ''

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)' }} />

      {/* Modal Card */}
      <div style={{ position: 'relative', background: '#fff', borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 490, boxShadow: '0 25px 60px -15px rgba(0,0,0,0.35)', animation: 'modalIn 0.25s cubic-bezier(0.16,1,0.3,1)', textAlign: 'center' }}>
        
        {/* Animated Celebration Icon */}
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 0 10px rgba(220, 252, 231, 0.5)' }}>
          <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Status pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ecfdf5', color: '#047857', borderRadius: 999, padding: '4px 14px', fontSize: 12, fontWeight: 700, marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span>
          Confirmed & Sync Locked
        </div>
        <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
          Booking Confirmed! 🎉
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
          Your appointment has been locked with zero conflicts. You can review, reschedule, or cancel it anytime in <strong>My Appointments</strong>.
        </p>

        {/* Appointment summary card */}
        <div style={{ background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', padding: '18px 20px', textAlign: 'left', marginBottom: 20 }}>
          {/* Doctor row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 14, borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
              {doctor?.picture ? (
                <img src={doctor.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                (doctor?.name || 'D')[0]
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>{docName}</div>
              <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 600 }}>{doctor?.specialization || 'General Practice'}</div>
            </div>
          </div>

          {/* Time & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, paddingTop: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>{dateStr}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Time ({TZ_LABELS[tz] || tz})</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', marginTop: 2 }}>
                {slot?.displayLocal} <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>({doctor?.appointmentLength || 30}m)</span>
              </div>
            </div>
          </div>

          {/* Multi-timezone preview */}
          {slot?.startUtc && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11, color: '#64748b' }}>
              <div><span style={{ fontWeight: 700, color: '#0f172a' }}>🇮🇳 IST:</span> {fmtTime(slot.startUtc, 'Asia/Kolkata')}</div>
              <div><span style={{ fontWeight: 700, color: '#0f172a' }}>🇬🇧 GMT:</span> {fmtTime(slot.startUtc, 'Europe/London')}</div>
              <div><span style={{ fontWeight: 700, color: '#0f172a' }}>🇺🇸 ET:</span> {fmtTime(slot.startUtc, 'America/New_York')}</div>
            </div>
          )}
        </div>

        {/* Helpful reminder */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, marginBottom: 24, textAlign: 'left' }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <span style={{ fontSize: 12, color: '#0369a1', lineHeight: 1.4 }}>
            You can check all details, reschedule, or cancel this booking anytime from <strong>My Appointments</strong>.
          </span>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onGoToAppointments}
            style={{ flex: 1.3, padding: '12px 18px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 14px rgba(2,132,199,0.3)', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0369a1'}
            onMouseLeave={e => e.currentTarget.style.background = '#0284c7'}
          >
            <span>My Appointments</span>
            <span>&rarr;</span>
          </button>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '12px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ── BROWSE + BOOK TAB ─────────────────────────────────────────────────
function BrowseTab({ patient, onBooked, showToast, onGoToAppointments }) {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [spec, setSpec]     = useState('')
  const [tzFilter, setTzFilter] = useState('')
  const [selected, setSelected] = useState(null)   // selected doctor for booking
  const [bookDate, setBookDate] = useState('')
  const [slots, setSlots]   = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [pickedSlot, setPickedSlot] = useState(null)
  const [booking, setBooking] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const debounceRef = useRef(null)

  const SPECIALTIES = [
    'All',
    'Cardiologist',
    'Neurologist',
    'Orthopedic Surgeon',
    'Pediatrician',
    'Dermatologist',
    'General Practice',
  ]

  const fetchDoctors = useCallback(async (n, s) => {
    setLoading(true)
    try {
      const res = await api.get('/doctors', { params: { name: n || undefined, specialization: s || undefined } })
      setDoctors(res.data)
    } catch { showToast('Failed to load doctors', 'error') }
    finally { setLoading(false) }
  }, [showToast])

  useEffect(() => { fetchDoctors('', '') }, [fetchDoctors])

  const handleSearch = (n, s) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchDoctors(n, s), 400)
  }

  const handleSpecialtyClick = (sp) => {
    const next = sp === 'All' ? '' : sp
    setSpec(next)
    fetchDoctors(search, next)
  }

  const fetchSlots = async (doctorId, date) => {
    if (!doctorId || !date) return
    setSlotsLoading(true)
    setSlots([])
    setPickedSlot(null)
    try {
      const tz = patient?.timezone || 'Asia/Kolkata'
      const res = await api.get('/slots', { params: { doctorId, date, timezone: tz } })
      setSlots(res.data.slots || [])
      if (!res.data.slots?.length) showToast(res.data.message || 'No slots on this day', 'info')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load slots', 'error')
    } finally { setSlotsLoading(false) }
  }

  const handleDateChange = (d) => {
    setBookDate(d)
    if (selected && d) fetchSlots(selected._id, d)
  }

  const book = async () => {
    if (!pickedSlot) return
    setBooking(true)
    try {
      const res = await api.post('/appointments', { doctorId: selected._id, startUtc: pickedSlot.startUtc })
      onBooked()
      setConfirmedBooking({
        doctor: selected,
        slot: pickedSlot,
        date: bookDate,
        appointment: res.data,
      })
      setSelected(null)
      setSlots([])
      setPickedSlot(null)
      setBookDate('')
    } catch (err) {
      showToast(err.response?.data?.message || 'Booking failed. Please try again.', 'error')
    } finally { setBooking(false) }
  }

  const tz = patient?.timezone || 'Asia/Kolkata'
  const todayStr = new Date().toISOString().slice(0, 10)

  // In-memory filter by timezone
  const filteredDoctors = doctors.filter(doc => {
    if (tzFilter && doc.timezone !== tzFilter) return false
    return true
  })

  return (
    <div>
      {/* Header & Filter Bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Find a Certified Doctor
            </h1>
            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
              Book cross-timezone telehealth consultations with verified medical specialists. Times shown in <strong style={{ color: '#0284c7' }}>{TZ_LABELS[tz] || tz}</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 999, padding: '6px 14px', fontSize: 12, color: '#0369a1', fontWeight: 600 }}>
            <Icon name="globe" size={14} />
            <span>Active Zone: {TZ_LABELS[tz] || tz}</span>
          </div>
        </div>

        {/* Search & Timezone Select */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <Icon name="search" size={18} />
            </span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); handleSearch(e.target.value, spec) }}
              placeholder="Search doctor by name or clinical keywords…"
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                background: '#fff',
                fontSize: 14,
                color: '#1e293b',
                outline: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <select
            value={tzFilter}
            onChange={e => setTzFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              background: '#fff',
              fontSize: 13,
              fontWeight: 600,
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              minWidth: 170,
            }}
          >
            <option value="">🌐 All Timezones</option>
            <option value="Asia/Kolkata">🇮🇳 India (IST)</option>
            <option value="Europe/London">🇬🇧 London (GMT/BST)</option>
            <option value="America/New_York">🇺🇸 New York (ET)</option>
          </select>
        </div>

        {/* Specialty Filter Chips */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {SPECIALTIES.map(s => {
            const active = (s === 'All' && !spec) || spec === s || (s === 'General Practice' && spec === 'General Practitioner')
            return (
              <button
                key={s}
                onClick={() => handleSpecialtyClick(s)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '7px 15px',
                  borderRadius: 999,
                  border: `1px solid ${active ? '#0284c7' : '#e2e8f0'}`,
                  background: active ? '#0284c7' : '#fff',
                  color: active ? '#fff' : '#64748b',
                  fontWeight: active ? 700 : 500,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: active ? '0 2px 8px rgba(2,132,199,0.25)' : 'none',
                }}
              >
                {s === 'All' ? '🏥 All Specialties' : s}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Area: Responsive Grid (or Split when Doctor Selected) */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 390px' : 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20, alignItems: 'start' }}>
        
        {/* Doctor List */}
        {loading ? (
          <div style={{ gridColumn: selected ? 'auto' : '1 / -1', display: 'grid', gridTemplateColumns: selected ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
            {[1, 2, 3, 4].map(i => <Sk key={i} h={180} r={20} />)}
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '56px 24px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="stethoscope" size={32} />
            </div>
            <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>No specialists found</h3>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 16px' }}>Try clearing your search terms or filters.</p>
            <button
              onClick={() => { setSearch(''); setSpec(''); setTzFilter(''); fetchDoctors('', '') }}
              style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid #bae6fd', background: '#f0f9ff', color: '#0284c7', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr' : 'contents', gap: 16 }}>
            {filteredDoctors.map(doc => {
              const isSelected = selected?._id === doc._id
              return (
                <div
                  key={doc._id}
                  onClick={() => {
                    setSelected(isSelected ? null : doc)
                    setSlots([])
                    setPickedSlot(null)
                    setBookDate('')
                  }}
                  style={{
                    background: '#fff',
                    borderRadius: 20,
                    border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    boxShadow: isSelected
                      ? '0 12px 30px rgba(2,132,199,0.15)'
                      : '0 4px 16px -2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.02)',
                    padding: '22px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 16,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#93c5fd'
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.boxShadow = '0 14px 34px -4px rgba(15,23,42,0.08)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.02)'
                    }
                  }}
                >
                  {/* Selected Indicator Strip */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                      }}
                    />
                  )}

                  <div>
                    {/* Top Row: Avatar + Identity + TZ */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 16,
                          background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontFamily: 'Outfit,sans-serif',
                          fontSize: 22,
                          fontWeight: 700,
                          flexShrink: 0,
                          overflow: 'hidden',
                          boxShadow: '0 4px 14px rgba(14,165,233,0.22)',
                        }}
                      >
                        {doc.picture ? (
                          <img src={doc.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          doc.name?.[0] || 'D'
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, color: '#0f172a', fontSize: 17, lineHeight: 1.2 }}>
                            {formatDoctorName(doc.name)}
                          </div>
                          <span
                            style={{
                              background: '#e0f2fe',
                              color: '#0369a1',
                              borderRadius: 999,
                              padding: '3px 10px',
                              fontSize: 11,
                              fontWeight: 700,
                              flexShrink: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            {doc.timezone === 'Asia/Kolkata' ? '🇮🇳 IST' : doc.timezone === 'Europe/London' ? '🇬🇧 GMT' : '🇺🇸 ET'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              background: '#f1f5f9',
                              color: '#334155',
                              borderRadius: 6,
                              padding: '2px 8px',
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {doc.specialization || 'General Practice'}
                          </span>
                          <span style={{ fontSize: 11, color: '#64748b' }}>
                            ⏱️ {doc.appointmentLength || 30} min slots
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {doc.bio && (
                      <p
                        style={{
                          fontSize: 13,
                          color: '#64748b',
                          lineHeight: 1.5,
                          margin: '14px 0 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {doc.bio}
                      </p>
                    )}
                  </div>

                  {/* Footer & Action */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#047857', fontWeight: 700 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        <span>Telehealth Active</span>
                      </div>

                      <button
                        style={{
                          padding: '8px 16px',
                          borderRadius: 10,
                          border: isSelected ? 'none' : '1px solid #bae6fd',
                          background: isSelected ? '#0284c7' : '#f0f9ff',
                          color: isSelected ? '#fff' : '#0284c7',
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 4px 12px rgba(2,132,199,0.3)' : 'none',
                        }}
                      >
                        <span>{isSelected ? '✓ Booking Open' : 'Book Appointment'}</span>
                        {!isSelected && <span>→</span>}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Elevated Booking Sidebar (When Doctor is Selected) */}
        {selected && (
          <div
            style={{
              background: '#fff',
              borderRadius: 22,
              border: '1px solid #bae6fd',
              boxShadow: '0 20px 45px -10px rgba(2,132,199,0.18)',
              overflow: 'visible',
              position: 'sticky',
              top: 80,
              animation: 'modalIn 0.25s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Sidebar Header with Close Button */}
            <div style={{ background: 'linear-gradient(135deg,#0284c7,#0ea5e9)', padding: '20px 22px', color: '#fff', borderRadius: '22px 22px 0 0', position: 'relative' }}>
              <button
                onClick={() => setSelected(null)}
                title="Close booking panel"
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                <Icon name="x" size={16} />
              </button>

              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Consultation Booking
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {selected.picture ? (
                    <img src={selected.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{(selected.name || 'D')[0]}</span>
                  )}
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 800 }}>{formatDoctorName(selected.name)}</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>{selected.specialization || 'General Practice'} · {selected.appointmentLength || 30}m session</div>
                </div>
              </div>
            </div>

            {/* Sidebar Body */}
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                1. Select Consultation Date
              </div>
              <RichCalendar value={bookDate} min={todayStr} onChange={handleDateChange} />

              {slotsLoading && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Sk h={38} r={10} />
                  <Sk h={38} r={10} />
                </div>
              )}

              {!slotsLoading && slots.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '18px 0 8px' }}>
                    2. Available Slots ({TZ_LABELS[tz] || tz})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {slots.map((slot, i) => {
                      const isPicked = pickedSlot?.startUtc === slot.startUtc
                      return (
                        <button
                          key={i}
                          onClick={() => setPickedSlot(isPicked ? null : slot)}
                          style={{
                            padding: '10px 6px',
                            borderRadius: 10,
                            border: `2px solid ${isPicked ? '#0284c7' : '#e2e8f0'}`,
                            background: isPicked ? '#0284c7' : '#fff',
                            color: isPicked ? '#fff' : '#0f172a',
                            fontWeight: isPicked ? 700 : 600,
                            fontSize: 13,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            textAlign: 'center',
                            boxShadow: isPicked ? '0 4px 12px rgba(2,132,199,0.3)' : 'none',
                          }}
                        >
                          {slot.displayLocal}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {!slotsLoading && bookDate && slots.length === 0 && (
                <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 12, textAlign: 'center', color: '#64748b', fontSize: 13, border: '1px dashed #cbd5e1' }}>
                  No available openings on this day
                </div>
              )}

              {/* World Clock Preview for Picked Slot */}
              {pickedSlot && (
                <div style={{ marginTop: 18, background: '#f8fafc', borderRadius: 14, padding: 14, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    <Icon name="globe" size={14} />
                    <span>Same Moment in 3 Timezones</span>
                  </div>
                  {[
                    ['Asia/Kolkata', 'IST', '🇮🇳 India'],
                    ['Europe/London', 'GMT/BST', '🇬🇧 London'],
                    ['America/New_York', 'ET', '🇺🇸 New York'],
                  ].map(([zone, label, city]) => (
                    <div
                      key={zone}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                        borderBottom: zone !== 'America/New_York' ? '1px solid #f1f5f9' : 'none',
                      }}
                    >
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{city} ({label})</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: zone === tz ? '#0284c7' : '#0f172a' }}>
                        {fmtTime(pickedSlot.startUtc, zone)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Confirm CTA */}
              <button
                onClick={book}
                disabled={!pickedSlot || booking}
                style={{
                  marginTop: 18,
                  width: '100%',
                  padding: '13px',
                  background: (!pickedSlot || booking) ? '#94a3b8' : 'linear-gradient(135deg,#0284c7,#0ea5e9)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: (!pickedSlot || booking) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: pickedSlot && !booking ? '0 6px 18px rgba(2,132,199,0.35)' : 'none',
                }}
              >
                {booking ? 'Locking Appointment…' : pickedSlot ? `Confirm ${pickedSlot.displayLocal} (${TZ_LABELS[tz]}) →` : 'Select a Slot Above'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rich Booking Confirmation Modal */}
      {confirmedBooking && (
        <BookingSuccessModal
          booking={confirmedBooking}
          tz={tz}
          onClose={() => setConfirmedBooking(null)}
          onGoToAppointments={() => {
            setConfirmedBooking(null)
            onGoToAppointments?.()
          }}
        />
      )}
    </div>
  )
}

// ── APPOINTMENTS TAB ──────────────────────────────────────────────────
function AppointmentsTab({ appointments, patient, onRefresh, showToast, onNavigate }) {
  const [filter, setFilter]       = useState('upcoming')
  const [cancelling, setCancelling] = useState(null)
  const [reschedule, setReschedule] = useState(null) // { appt, newDate, slots, newSlot }
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const tz = patient?.timezone || 'Asia/Kolkata'
  const now = new Date()

  const upcomingCount = appointments.filter(a => a.status === 'confirmed' && new Date(a.startUtc) > now).length
  const pastCount     = appointments.filter(a => a.status === 'confirmed' && new Date(a.startUtc) <= now).length
  const cancelledCount= appointments.filter(a => a.status === 'cancelled').length
  const allCount      = appointments.length

  const filterCounts = {
    upcoming: upcomingCount,
    past: pastCount,
    cancelled: cancelledCount,
    all: allCount,
  }

  const filtered = appointments.filter(a => {
    if (filter === 'upcoming') return a.status === 'confirmed' && new Date(a.startUtc) > now
    if (filter === 'past')     return a.status === 'confirmed' && new Date(a.startUtc) <= now
    if (filter === 'cancelled') return a.status === 'cancelled'
    return true
  })

  const cancelAppt = async (appt) => {
    if (hoursUntil(appt.startUtc) < 2) {
      return showToast('Cancellations must be made at least 2 hours before the appointment.', 'error')
    }
    setCancelling(appt._id)
    try {
      await api.delete(`/appointments/${appt._id}`)
      showToast('Appointment cancelled.', 'success')
      onRefresh()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel', 'error')
    } finally { setCancelling(null) }
  }

  const openReschedule = (appt) => setReschedule({ appt, newDate: '', slots: [], newSlot: null })

  const fetchRescheduleSlots = async (date) => {
    const { appt } = reschedule
    setSlotsLoading(true)
    setReschedule(r => ({ ...r, newDate: date, slots: [], newSlot: null }))
    try {
      const docId = appt.doctor?._id || appt.doctor
      const res = await api.get('/slots', { params: { doctorId: docId, date, timezone: tz } })
      setReschedule(r => ({ ...r, slots: res.data.slots || [] }))
    } catch { showToast('Failed to load slots', 'error') }
    finally { setSlotsLoading(false) }
  }

  const submitReschedule = async () => {
    if (!reschedule?.newSlot) return
    setSubmitting(true)
    try {
      await api.put(`/appointments/${reschedule.appt._id}/reschedule`, { newStartUtc: reschedule.newSlot.startUtc })
      showToast('Appointment rescheduled successfully!', 'success')
      setReschedule(null)
      onRefresh()
    } catch (err) {
      showToast(err.response?.data?.message || 'Rescheduling failed. Original appointment kept.', 'error')
    } finally { setSubmitting(false) }
  }

  return (
    <div>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
            My Appointments
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Real-time cross-timezone appointments synchronized to your active timezone: <strong style={{ color: '#0284c7' }}>{TZ_LABELS[tz] || tz}</strong>
          </p>
        </div>

        {/* Filter Pills with Counters */}
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 14, padding: 4, border: '1px solid #e2e8f0' }}>
          {['upcoming', 'past', 'cancelled', 'all'].map(f => {
            const active = filter === f
            const count = filterCounts[f]
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: active ? '#fff' : 'transparent',
                  color: active ? '#0284c7' : '#64748b',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                  textTransform: 'capitalize',
                }}
              >
                <span>{f}</span>
                <span
                  style={{
                    background: active ? '#e0f2fe' : '#e2e8f0',
                    color: active ? '#0369a1' : '#64748b',
                    borderRadius: 999,
                    padding: '1px 7px',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(15,23,42,0.03)',
            padding: '60px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#f0f9ff',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Icon name="calendar" size={32} />
          </div>
          <h3 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            No {filter} appointments found
          </h3>
          <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 20px', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
            {filter === 'upcoming'
              ? 'You have no consultations on your schedule. Find a certified doctor and book across timezones in seconds.'
              : `You have no ${filter} appointments in your records.`}
          </p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('browse')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 24px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2,132,199,0.3)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#0369a1')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0284c7')}
            >
              <span>Find a Doctor</span>
              <Icon name="arrowRight" size={16} />
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(a => {
            const canCancel   = a.status === 'confirmed' && hoursUntil(a.startUtc) >= 2
            const canReschedule = a.status === 'confirmed' && hoursUntil(a.startUtc) >= 2
            const isRescheduling = reschedule?.appt?._id === a._id
            const dateParts = getDateParts(a.startUtc, tz)
            const urgency = a.status === 'confirmed' ? getUrgencyLabel(a.startUtc) : null

            return (
              <div
                key={a._id}
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  border: isRescheduling ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  boxShadow: isRescheduling
                    ? '0 12px 30px rgba(2,132,199,0.12)'
                    : '0 4px 20px -2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.02)',
                  transition: 'all 0.2s ease',
                  overflow: isRescheduling ? 'visible' : 'hidden',
                  position: 'relative',
                  zIndex: isRescheduling ? 40 : 1,
                }}
              >
                {/* Top Meta Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #f1f5f9',
                    fontSize: 12,
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {urgency && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '3px 10px',
                          borderRadius: 999,
                          background: urgency.urgent ? '#fee2e2' : '#e0f2fe',
                          color: urgency.urgent ? '#dc2626' : '#0369a1',
                          fontWeight: 700,
                          fontSize: 11,
                          letterSpacing: '0.02em',
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: urgency.urgent ? '#dc2626' : '#0284c7',
                            animation: urgency.urgent ? 'pulseGlow 1.2s infinite' : 'none',
                          }}
                        />
                        {urgency.text}
                      </span>
                    )}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#475569', fontWeight: 600 }}>
                      <Icon name="video" size={14} /> Telehealth Consultation
                    </span>
                    <span style={{ color: '#cbd5e1' }}>•</span>
                    <span style={{ color: '#64748b', fontSize: 11 }}>
                      Ref: <code style={{ color: '#334155', fontWeight: 600, background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>#{a._id.slice(-6).toUpperCase()}</code>
                    </span>
                  </div>

                  <Badge status={a.status} />
                </div>

                {/* Main Content Row */}
                <div
                  style={{
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 20,
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Left: Tear-sheet Calendar Tile */}
                  <div
                    style={{
                      width: 68,
                      height: 72,
                      borderRadius: 14,
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                      textAlign: 'center',
                      flexShrink: 0,
                      background: '#fff',
                    }}
                  >
                    <div
                      style={{
                        background: 'linear-gradient(135deg,#0284c7,#0ea5e9)',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        padding: '3px 0',
                        textTransform: 'uppercase',
                      }}
                    >
                      {dateParts.month}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                        {dateParts.day}
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginTop: 2 }}>
                        {dateParts.weekday}
                      </div>
                    </div>
                  </div>

                  {/* Center: Doctor Info & Appointment Time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 260 }}>
                    {/* Doctor photo/avatar */}
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: 'linear-gradient(135deg,#0ea5e9,#6366f1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontFamily: 'Outfit,sans-serif',
                        fontSize: 18,
                        fontWeight: 700,
                        flexShrink: 0,
                        overflow: 'hidden',
                        boxShadow: '0 3px 10px rgba(14,165,233,0.2)',
                      }}
                    >
                      {a.doctor?.picture ? (
                        <img src={a.doctor.picture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        a.doctor?.name?.[0] || 'D'
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'Outfit,sans-serif', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                          {formatDoctorName(a.doctor?.name)}
                        </span>
                        <span
                          style={{
                            background: '#f0f9ff',
                            color: '#0369a1',
                            border: '1px solid #bae6fd',
                            borderRadius: 6,
                            padding: '2px 8px',
                            fontSize: 11,
                            fontWeight: 600,
                          }}
                        >
                          {a.doctor?.specialization || 'General Practice'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#0284c7', fontWeight: 800, fontSize: 15 }}>
                          <Icon name="clock" size={15} />
                          <span>{fmtTime(a.startUtc, tz)}</span>
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>({TZ_LABELS[tz] || tz})</span>
                        <span style={{ color: '#cbd5e1' }}>•</span>
                        <span style={{ fontSize: 13, color: '#475569' }}>{dateParts.fullDate}</span>
                        <span style={{ color: '#cbd5e1' }}>•</span>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{a.doctor?.appointmentLength || 30} min session</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    {a.status === 'confirmed' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {canReschedule && (
                          <button
                            onClick={() => (isRescheduling ? setReschedule(null) : openReschedule(a))}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '8px 14px',
                              background: isRescheduling ? '#e2e8f0' : '#eff6ff',
                              border: `1px solid ${isRescheduling ? '#cbd5e1' : '#bfdbfe'}`,
                              borderRadius: 10,
                              color: isRescheduling ? '#475569' : '#1d4ed8',
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (!isRescheduling) e.currentTarget.style.background = '#dbeafe'
                            }}
                            onMouseLeave={(e) => {
                              if (!isRescheduling) e.currentTarget.style.background = '#eff6ff'
                            }}
                          >
                            <Icon name="edit" size={14} />
                            {isRescheduling ? 'Close' : 'Reschedule'}
                          </button>
                        )}

                        {canCancel && (
                          <button
                            onClick={() => cancelAppt(a)}
                            disabled={cancelling === a._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '8px 14px',
                              background: '#fff1f2',
                              border: '1px solid #fecdd3',
                              borderRadius: 10,
                              color: '#e11d48',
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: cancelling === a._id ? 'not-allowed' : 'pointer',
                              opacity: cancelling === a._id ? 0.6 : 1,
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#ffe4e6')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff1f2')}
                          >
                            <Icon name="trash" size={14} />
                            {cancelling === a._id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        )}

                        {!canCancel && new Date(a.startUtc) > now && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                              background: '#fef3c7',
                              border: '1px solid #fde68a',
                              color: '#b45309',
                              borderRadius: 8,
                              padding: '6px 10px',
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                            title="Appointments cannot be cancelled within 2 hours of scheduled time"
                          >
                            <Icon name="lock" size={12} />
                            <span>Lock: &lt;2h before visit</span>
                          </div>
                        )}
                      </div>
                    )}

                    {a.status === 'cancelled' && (
                      <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                        Appointment cancelled
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Cross-Timezone World Clock Strip */}
                <div
                  style={{
                    padding: '12px 20px',
                    background: '#f8fafc',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <Icon name="globe" size={14} />
                    <span>3-Zone Sync:</span>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
                    {[
                      ['Asia/Kolkata', 'IST', '🇮🇳 IST (India)', 'Asia/Kolkata' === tz],
                      ['Europe/London', 'GMT', '🇬🇧 GMT (London)', 'Europe/London' === tz],
                      ['America/New_York', 'ET', '🇺🇸 ET (New York)', 'America/New_York' === tz],
                    ].map(([zone, label, city, isUserTz]) => (
                      <div
                        key={zone}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 8,
                          background: isUserTz ? '#f0f9ff' : '#fff',
                          border: `1px solid ${isUserTz ? '#7dd3fc' : '#e2e8f0'}`,
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: '#475569', fontWeight: 500 }}>{city}:</span>
                        <span style={{ fontWeight: 700, color: isUserTz ? '#0284c7' : '#0f172a' }}>
                          {fmtTime(a.startUtc, zone)}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                          {fmtDate(a.startUtc, zone)}
                        </span>
                        {isUserTz && (
                          <span style={{ background: '#0284c7', color: '#fff', borderRadius: 4, padding: '0 4px', fontSize: 9, fontWeight: 700 }}>
                            YOU
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inline Reschedule Drawer */}
                {isRescheduling && (
                  <div
                    style={{
                      borderTop: '2px solid #bae6fd',
                      padding: '24px',
                      background: '#f0f9ff',
                      borderRadius: '0 0 20px 20px',
                      animation: 'slideUp 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, color: '#0369a1', fontSize: 16 }}>
                          Select a New Date & Time Slot
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          Original appointment remains confirmed until you finalize a new slot.
                        </div>
                      </div>
                      <button
                        onClick={() => setReschedule(null)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                      >
                        <Icon name="x" size={18} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div style={{ width: 280, position: 'relative', zIndex: 100 }}>
                        <label style={{ ...labelStyle, marginBottom: 8, color: '#0369a1' }}>1. Choose Date</label>
                        <RichCalendar
                          value={reschedule.newDate}
                          min={new Date().toISOString().slice(0, 10)}
                          onChange={fetchRescheduleSlots}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 280 }}>
                        <label style={{ ...labelStyle, marginBottom: 8, color: '#0369a1' }}>
                          2. Choose Slot ({TZ_LABELS[tz] || tz})
                        </label>
                        {slotsLoading && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Sk h={36} />
                            <Sk h={36} />
                          </div>
                        )}

                        {!slotsLoading && reschedule.slots.length > 0 && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                            {reschedule.slots.map((s, i) => {
                              const on = reschedule.newSlot?.startUtc === s.startUtc
                              return (
                                <button
                                  key={i}
                                  onClick={() => setReschedule((r) => ({ ...r, newSlot: on ? null : s }))}
                                  style={{
                                    padding: '9px 12px',
                                    borderRadius: 10,
                                    border: `2px solid ${on ? '#0284c7' : '#e2e8f0'}`,
                                    background: on ? '#0284c7' : '#fff',
                                    color: on ? '#fff' : '#1e293b',
                                    fontWeight: on ? 700 : 600,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: on ? '0 4px 12px rgba(2,132,199,0.3)' : 'none',
                                  }}
                                >
                                  {s.displayLocal}
                                </button>
                              )
                            })}
                          </div>
                        )}

                        {!slotsLoading && reschedule.newDate && reschedule.slots.length === 0 && (
                          <div
                            style={{
                              padding: '24px 16px',
                              background: '#fff',
                              border: '1px dashed #cbd5e1',
                              borderRadius: 12,
                              textAlign: 'center',
                              color: '#64748b',
                              fontSize: 13,
                            }}
                          >
                            No available slots on this day. Please select another date.
                          </div>
                        )}

                        {!reschedule.newDate && (
                          <div
                            style={{
                              padding: '24px 16px',
                              background: '#fff',
                              border: '1px dashed #cbd5e1',
                              borderRadius: 12,
                              textAlign: 'center',
                              color: '#94a3b8',
                              fontSize: 13,
                            }}
                          >
                            Pick a date on the left to view available openings
                          </div>
                        )}
                      </div>
                    </div>

                    {reschedule.newSlot && (
                      <div
                        style={{
                          marginTop: 16,
                          padding: '12px 16px',
                          background: '#fff',
                          border: '1px solid #7dd3fc',
                          borderRadius: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 11, color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>
                            Selected New Time ({TZ_LABELS[tz] || tz})
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                            {reschedule.newSlot.displayLocal} · {fmtDate(reschedule.newSlot.startUtc, tz)}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            onClick={submitReschedule}
                            disabled={submitting}
                            style={{
                              padding: '10px 20px',
                              background: submitting ? '#94a3b8' : '#0284c7',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 10,
                              fontWeight: 700,
                              fontSize: 13,
                              cursor: submitting ? 'not-allowed' : 'pointer',
                              boxShadow: '0 4px 14px rgba(2,132,199,0.3)',
                            }}
                          >
                            {submitting ? 'Rescheduling…' : 'Confirm Reschedule'}
                          </button>
                          <button
                            onClick={() => setReschedule(null)}
                            style={{
                              padding: '10px 16px',
                              background: '#f1f5f9',
                              border: 'none',
                              borderRadius: 10,
                              fontWeight: 600,
                              fontSize: 13,
                              color: '#64748b',
                              cursor: 'pointer',
                            }}
                          >
                            Keep Current Slot
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── SETTINGS TAB ──────────────────────────────────────────────────────
function SettingsTab({ patient, onSaved, showToast }) {
  const [tz, setTz] = useState(patient?.timezone || 'Asia/Kolkata')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', { timezone: tz })
      onSaved(res.data)
      showToast('Settings saved!', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 700, color: '#1e293b', margin: '0 0 24px' }}>Settings</h1>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', padding: 24, maxWidth: 480 }}>
        <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Your Timezone</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>Appointment times will be shown in this timezone across the app.</p>
        <label style={labelStyle}>Timezone</label>
        <select value={tz} onChange={e => setTz(e.target.value)} style={inputStyle}>
          {TIMEZONES.map(t => <option key={t} value={t}>{t} ({TZ_LABELS[t]})</option>)}
        </select>

        <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 10 }}>Current time in each zone</div>
          {[['Asia/Kolkata','IST'],['Europe/London','GMT/BST'],['America/New_York','ET']].map(([zone, label]) => (
            <div key={zone} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: zone !== 'America/New_York' ? '1px solid #e2e8f0' : 'none' }}>
              <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: zone === tz ? '#0284c7' : '#1e293b' }}>
                {fmtTime(new Date().toISOString(), zone)}
              </span>
            </div>
          ))}
        </div>

        <button onClick={save} disabled={saving} style={{ marginTop: 16, padding: '11px 28px', background: saving ? '#94a3b8' : '#0284c7', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

// ── PATIENT PROFILE MODAL ────────────────────────────────────────────────
function PatientProfileModal({ patient, onClose, onSaved, showToast }) {
  const [name, setName] = useState(patient?.name || '')
  const [tz, setTz] = useState(patient?.timezone || 'Asia/Kolkata')
  const [saving, setSaving] = useState(false)

  const ZONES = [
    { tz: 'Asia/Kolkata',     label: 'IST',    flag: '🇮🇳', full: 'India Standard Time' },
    { tz: 'Europe/London',    label: 'GMT/BST', flag: '🇬🇧', full: 'London / GMT' },
    { tz: 'America/New_York', label: 'ET',      flag: '🇺🇸', full: 'Eastern Time' },
  ]

  const save = async () => {
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', { name, timezone: tz })
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>My Profile</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Update your name and timezone</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, padding: 16, background: '#f0fdf4', borderRadius: 14, border: '1px solid #86efac' }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
            {patient?.picture ? <img src={patient.picture} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover' }} /> : (patient?.name || 'P')[0]}
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{patient?.name}</div>
            <div style={{ fontSize: 12, color: '#059669', marginTop: 2 }}>{patient?.email || ''}</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter,sans-serif' }} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Timezone</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ZONES.map(z => {
              const sel = tz === z.tz
              const now = new Intl.DateTimeFormat('en-GB', { timeZone: z.tz, hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date())
              return (
                <button key={z.tz} onClick={() => setTz(z.tz)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  borderRadius: 12, border: `1.5px solid ${sel ? '#10b981' : '#e2e8f0'}`,
                  background: sel ? '#f0fdf4' : '#f8fafc', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                }}>
                  <span style={{ fontSize: 22 }}>{z.flag}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: sel ? 700 : 600, color: sel ? '#059669' : '#1e293b' }}>{z.full}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Now: {now}</div>
                  </div>
                  {sel && <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 0', background: saving ? '#94a3b8' : '#059669', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>
            <Icon name="check" size={16} /> {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', background: '#fff', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter,sans-serif' }
const labelStyle  = { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }

// ── MAIN ──────────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const { appUser, setAppUser } = useAppUser()
  const { logout } = useAuth0()
  const [active, setActive]       = useState('overview')
  const [appointments, setAppointments] = useState([])
  const [loadingAppts, setLoadingAppts] = useState(true)
  const [toast, setToast]         = useState(null)
  const [patient, setPatient]     = useState(appUser)

  useEffect(() => {
    if (appUser) setPatient(appUser)
  }, [appUser])

  const showToast = useCallback((msg, type = 'success') => setToast({ msg, type }), [])

  const fetchAppointments = useCallback(async () => {
    setLoadingAppts(true)
    try {
      const res = await api.get('/appointments')
      setAppointments(res.data)
    } catch { showToast('Failed to load appointments', 'error') }
    finally { setLoadingAppts(false) }
  }, [showToast])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const [showPatientProfile, setShowPatientProfile] = useState(false)
  const handleSaved = (updated) => { setPatient(updated); setAppUser(updated) }

  const handleTzChange = async (newTz) => {
    try {
      const res = await api.put('/auth/profile', { timezone: newTz })
      handleSaved(res.data)
      showToast('Timezone updated to ' + newTz, 'success')
    } catch { showToast('Failed to update timezone', 'error') }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: 'linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%)', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;700;800&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes tzIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes calIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGlow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.15); } }
        * { box-sizing: border-box; }
        input:focus, select:focus, textarea:focus { border-color: #0ea5e9 !important; box-shadow: 0 0 0 3px rgba(14,165,233,0.1) !important; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.45); border-radius: 4px; }
      `}</style>

      <Sidebar active={active} setActive={setActive} patient={patient} onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })} onOpenProfile={() => setShowPatientProfile(true)} />

      <main style={{ marginLeft: 240, padding: 32, minHeight: '100vh' }}>
        {/* Sticky header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(248,250,252,0.85)', backdropFilter: 'blur(12px)', padding: '12px 0', marginBottom: 24, borderBottom: '1px solid rgba(226,232,240,0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>🟢 Patient</span>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {fmtTime(new Date().toISOString(), patient?.timezone || 'Asia/Kolkata')} · {TZ_LABELS[patient?.timezone || 'Asia/Kolkata']}
            </span>
            <button onClick={fetchAppointments} style={{ marginLeft: 'auto', background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#64748b', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="refresh" size={13} /> Refresh
            </button>
          </div>
        </div>

        {active === 'overview'     && <OverviewTab patient={patient} appointments={appointments} onNavigate={setActive} />}
        {active === 'browse'       && <BrowseTab patient={patient} onBooked={fetchAppointments} showToast={showToast} onGoToAppointments={() => setActive('appointments')} />}
        {active === 'appointments' && <AppointmentsTab appointments={appointments} patient={patient} onRefresh={fetchAppointments} showToast={showToast} onNavigate={setActive} />}
      </main>

      {showPatientProfile && (
        <PatientProfileModal
          patient={patient}
          onClose={() => setShowPatientProfile(false)}
          onSaved={handleSaved}
          showToast={showToast}
        />
      )}

    </div>
  )
}
