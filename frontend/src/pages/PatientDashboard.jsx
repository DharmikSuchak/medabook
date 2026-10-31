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
  const m = { confirmed: ['#dcfce7','#15803d','Confirmed'], cancelled: ['#fee2e2','#dc2626','Cancelled'], rescheduled: ['#fef3c7','#b45309','Rescheduled'] }
  const [bg, color, label] = m[status] || ['#f1f5f9','#64748b', status]
  return <span style={{ background: bg, color, borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{label}</span>
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
            Dr. {nextAppt.doctor?.name}
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
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>Dr. {a.doctor?.name}</div>
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
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 500, background: '#fff', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', padding: '16px', animation: 'calIn 0.18s ease' }}>
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


// ── BROWSE + BOOK TAB ─────────────────────────────────────────────────
function BrowseTab({ patient, onBooked, showToast }) {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [spec, setSpec]     = useState('')
  const [selected, setSelected] = useState(null)   // selected doctor for booking
  const [bookDate, setBookDate] = useState('')
  const [slots, setSlots]   = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [pickedSlot, setPickedSlot] = useState(null)
  const [booking, setBooking] = useState(false)
  const debounceRef = useRef(null)

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
      await api.post('/appointments', { doctorId: selected._id, startUtc: pickedSlot.startUtc })
      showToast(`Appointment booked with Dr. ${selected.name}!`, 'success')
      onBooked()
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20, alignItems: 'start' }}>
      {/* Doctor list */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>Find a Doctor</h1>
          <span style={{ fontSize: 13, color: '#64748b' }}>Times shown in <strong>{TZ_LABELS[tz]}</strong></span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}><Icon name="search" size={16} /></span>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); handleSearch(e.target.value, spec) }}
              placeholder="Search by name…"
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>
          <input
            value={spec}
            onChange={e => { setSpec(e.target.value); handleSearch(search, e.target.value) }}
            placeholder="Specialization…"
            style={{ ...inputStyle, width: 200 }}
          />
        </div>

        {/* Doctor cards */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <Sk key={i} h={100} r={16} />)}
          </div>
        ) : doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
            <Icon name="stethoscope" size={40} />
            <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '12px 0 4px' }}>No doctors found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {doctors.map(doc => {
              const isSelected = selected?._id === doc._id
              return (
                <div key={doc._id} onClick={() => { setSelected(isSelected ? null : doc); setSlots([]); setPickedSlot(null); setBookDate('') }}
                  style={{ background: '#fff', borderRadius: 16, border: `2px solid ${isSelected ? '#0284c7' : '#f1f5f9'}`, boxShadow: isSelected ? '0 0 0 4px rgba(2,132,199,0.1)' : '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', padding: '16px 20px', cursor: 'pointer', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                    {doc.name?.[0] || 'D'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>Dr. {doc.name}</div>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{doc.specialization || 'General Practice'}</div>
                    {doc.bio && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, maxWidth: 480 }}>{doc.bio.slice(0, 100)}{doc.bio.length > 100 ? '…' : ''}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                      {TZ_LABELS[doc.timezone] || 'Doctor'}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{doc.appointmentLength || 30} min slots</div>
                  </div>
                  {isSelected && <span style={{ color: '#0284c7' }}><Icon name="check" size={20} /></span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Booking panel */}
      {selected && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 8px 24px rgba(0,0,0,0.06)', overflow: 'visible', position: 'sticky', top: 80 }}>
          <div style={{ background: 'linear-gradient(135deg,#0284c7,#0ea5e9)', padding: '20px 24px', color: '#fff' }}>
            <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Booking with</div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700 }}>Dr. {selected.name}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>{selected.specialization || 'General Practice'} · {selected.appointmentLength || 30} min</div>
          </div>

          <div style={{ padding: 20 }}>
            <RichCalendar value={bookDate} min={todayStr} onChange={handleDateChange} />

            {slotsLoading && <div style={{ marginTop: 16 }}><Sk h={40} /><Sk h={40} /></div>}

            {!slotsLoading && slots.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', margin: '16px 0 8px' }}>
                  Available slots <span style={{ color: '#94a3b8', fontWeight: 400 }}>({TZ_LABELS[tz]})</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {slots.map((slot, i) => {
                    const isPicked = pickedSlot?.startUtc === slot.startUtc
                    return (
                      <button key={i} onClick={() => setPickedSlot(isPicked ? null : slot)}
                        style={{ padding: '10px 6px', borderRadius: 10, border: `2px solid ${isPicked ? '#0284c7' : '#e2e8f0'}`, background: isPicked ? '#f0f9ff' : '#fff', color: isPicked ? '#0284c7' : '#334155', fontWeight: isPicked ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}>
                        {slot.displayLocal}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {!slotsLoading && bookDate && slots.length === 0 && (
              <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 10, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                No available slots on this day
              </div>
            )}

            {/* Time zone preview */}
            {pickedSlot && (
              <div style={{ marginTop: 16, background: '#f8fafc', borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Same moment, 3 timezones</div>
                {[['Asia/Kolkata','IST'],['Europe/London','GMT/BST'],['America/New_York','ET']].map(([zone, label]) => (
                  <div key={zone} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: zone !== 'America/New_York' ? '1px solid #e2e8f0' : 'none' }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{fmtTime(pickedSlot.startUtc, zone)}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={book}
              disabled={!pickedSlot || booking}
              style={{ marginTop: 16, width: '100%', padding: 13, background: (!pickedSlot || booking) ? '#94a3b8' : '#0284c7', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: (!pickedSlot || booking) ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}>
              {booking ? 'Confirming…' : pickedSlot ? `Confirm ${pickedSlot.displayLocal}` : 'Select a slot above'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── APPOINTMENTS TAB ──────────────────────────────────────────────────
function AppointmentsTab({ appointments, patient, onRefresh, showToast }) {
  const [filter, setFilter]       = useState('upcoming')
  const [cancelling, setCancelling] = useState(null)
  const [reschedule, setReschedule] = useState(null) // { appt, newDate, slots, newSlot }
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const tz = patient?.timezone || 'Asia/Kolkata'
  const now = new Date()

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
      const res = await api.get('/slots', { params: { doctorId: appt.doctor._id, date, timezone: tz } })
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: 24, fontWeight: 700, color: '#1e293b', margin: 0 }}>My Appointments</h1>
        <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
          {['upcoming','past','cancelled','all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: filter === f ? '#fff' : 'transparent', color: filter === f ? '#0f172a' : '#64748b', fontWeight: filter === f ? 700 : 500, fontSize: 13, cursor: 'pointer', boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s', textTransform: 'capitalize' }}>{f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '56px 24px', textAlign: 'center', color: '#94a3b8' }}>
          <Icon name="calendar" size={40} />
          <p style={{ fontFamily: 'Outfit,sans-serif', fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '12px 0 4px' }}>No {filter} appointments</p>
          <p style={{ fontSize: 14, margin: 0 }}>Book a slot from the Find Doctors tab.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(a => {
            const canCancel   = a.status === 'confirmed' && hoursUntil(a.startUtc) >= 2
            const canReschedule = a.status === 'confirmed' && hoursUntil(a.startUtc) >= 2
            const isRescheduling = reschedule?.appt?._id === a._id

            return (
              <div key={a._id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', boxShadow: '0 0 0 1px rgba(0,0,0,0.03),0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#0ea5e9,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                    {a.doctor?.name?.[0] || 'D'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>Dr. {a.doctor?.name}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{a.doctor?.specialization}</div>
                    {/* Multi-timezone display */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                      {[['Asia/Kolkata','IST'],['Europe/London','GMT'],['America/New_York','ET']].map(([zone, label]) => (
                        <div key={zone} style={{ background: '#f8fafc', borderRadius: 8, padding: '4px 10px' }}>
                          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>{label}</span>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{fmtTime(a.startUtc, zone)}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{fmtDate(a.startUtc, zone)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <Badge status={a.status} />
                    {a.status === 'confirmed' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {canReschedule && (
                          <button onClick={() => isRescheduling ? setReschedule(null) : openReschedule(a)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: isRescheduling ? '#f1f5f9' : '#dbeafe', border: 'none', borderRadius: 8, color: isRescheduling ? '#64748b' : '#1d4ed8', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                            <Icon name="edit" size={12} /> Reschedule
                          </button>
                        )}
                        {canCancel && (
                          <button onClick={() => cancelAppt(a)} disabled={cancelling === a._id}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: '#fee2e2', border: 'none', borderRadius: 8, color: '#dc2626', fontWeight: 700, fontSize: 12, cursor: cancelling === a._id ? 'not-allowed' : 'pointer', opacity: cancelling === a._id ? 0.6 : 1 }}>
                            <Icon name="trash" size={12} /> {cancelling === a._id ? '…' : 'Cancel'}
                          </button>
                        )}
                        {!canCancel && new Date(a.startUtc) > now && (
                          <span style={{ fontSize: 11, color: '#b45309', background: '#fef3c7', borderRadius: 8, padding: '4px 10px', fontWeight: 600 }}>
                            &lt;2h: no cancel
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline reschedule panel */}
                {isRescheduling && (
                  <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px', background: '#f8fafc' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14, marginBottom: 12 }}>Reschedule to a new slot</div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div>
                        <RichCalendar value={reschedule.newDate} min={new Date().toISOString().slice(0,10)} onChange={fetchRescheduleSlots} />
                      </div>
                      {slotsLoading && <div style={{ marginTop: 22 }}><Sk h={36} w={280} /></div>}
                      {!slotsLoading && reschedule.slots.length > 0 && (
                        <div>
                          <label style={labelStyle}>Pick a slot</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {reschedule.slots.map((s, i) => {
                              const on = reschedule.newSlot?.startUtc === s.startUtc
                              return (
                                <button key={i} onClick={() => setReschedule(r => ({ ...r, newSlot: on ? null : s }))}
                                  style={{ padding: '7px 14px', borderRadius: 8, border: `2px solid ${on ? '#0284c7' : '#e2e8f0'}`, background: on ? '#f0f9ff' : '#fff', color: on ? '#0284c7' : '#334155', fontWeight: on ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.12s' }}>
                                  {s.displayLocal}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      {!slotsLoading && reschedule.newDate && reschedule.slots.length === 0 && (
                        <div style={{ marginTop: 22, fontSize: 13, color: '#94a3b8' }}>No slots on this day</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                      <button onClick={submitReschedule} disabled={!reschedule.newSlot || submitting}
                        style={{ padding: '9px 20px', background: (!reschedule.newSlot || submitting) ? '#94a3b8' : '#0284c7', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: (!reschedule.newSlot || submitting) ? 'not-allowed' : 'pointer' }}>
                        {submitting ? 'Rescheduling…' : 'Confirm Reschedule'}
                      </button>
                      <button onClick={() => setReschedule(null)} style={{ padding: '9px 20px', background: '#f1f5f9', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                    </div>
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
        {active === 'browse'       && <BrowseTab patient={patient} onBooked={fetchAppointments} showToast={showToast} />}
        {active === 'appointments' && <AppointmentsTab appointments={appointments} patient={patient} onRefresh={fetchAppointments} showToast={showToast} />}
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
