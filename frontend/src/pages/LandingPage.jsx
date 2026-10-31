import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'

// ── Inline SVG icons (no external dependency at runtime needed) ──
const Icon = ({ name, size = 20, color = 'currentColor' }) => {
  const icons = {
    calendar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    lock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    globe: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    shield: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    clock: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    zap: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    bell: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    check: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    arrowRight: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
      </svg>
    ),
    xCircle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    database: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    server: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
      </svg>
    ),
    layers: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
      </svg>
    ),
    smartphone: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    repeat: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    activity: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    play: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
      </svg>
    ),
    logoMark: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L3 6v4c0 4.418 2.865 8.166 7 9 4.135-.834 7-4.582 7-9V6L10 2z" fill="white" fillOpacity="0.9"/>
        <path d="M7 10l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  }
  return icons[name] || null
}

// ── Reusable Badge Pill ──
const BadgePill = ({ children }) => (
  <span className="badge-pill">
    <span className="badge-dot" />
    {children}
  </span>
)

// ── Role Picker Modal (shown before Auth0 login) ──
function RolePickerModal({ onSelect, onClose }) {
  return (
    <div className="role-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Choose your role">
      <div className="role-modal-card" onClick={e => e.stopPropagation()}>
        <button className="role-modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2 className="role-modal-title">I am a…</h2>
        <p className="role-modal-sub">Choose your role to get started. You can only pick once.</p>
        <div className="role-modal-options">
          <button
            id="modal-patient-btn"
            className="role-modal-option"
            onClick={() => onSelect('patient')}
          >
            <span className="role-modal-icon">👤</span>
            <span className="role-modal-label">Patient</span>
            <span className="role-modal-desc">Book appointments with doctors</span>
          </button>
          <button
            id="modal-doctor-btn"
            className="role-modal-option"
            onClick={() => onSelect('doctor')}
          >
            <span className="role-modal-icon">🩺</span>
            <span className="role-modal-label">Doctor</span>
            <span className="role-modal-desc">Manage your schedule & patients</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Nav Component ──
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [screenHint, setScreenHint] = useState('login')
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openModal = (hint = 'login') => {
    setScreenHint(hint)
    setShowModal(true)
  }

  const handleRoleSelect = (role) => {
    localStorage.setItem('pendingRole', role)
    setShowModal(false)
    loginWithRedirect({ authorizationParams: { screen_hint: screenHint } })
  }

  return (
    <>
      {showModal && (
        <RolePickerModal
          onSelect={handleRoleSelect}
          onClose={() => setShowModal(false)}
        />
      )}
      <nav className={`nav${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="container">
          <div className="nav-inner">
            <a href="/" className="nav-logo" aria-label="MedaBook home">
              <div className="nav-logo-icon">
                <Icon name="logoMark" size={20} />
              </div>
              <span className="nav-logo-text">MedaBook</span>
            </a>

            <ul className="nav-links" role="list">
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#for-doctors">For doctors</a></li>
              <li><a href="#for-patients">For patients</a></li>
            </ul>

            <div className="nav-cta">
              {isAuthenticated ? (
                <>
                  <a href="/dashboard" className="btn-secondary" id="nav-dashboard-btn">My dashboard</a>
                  <button
                    id="nav-logout-btn"
                    className="btn-primary"
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    id="nav-login-btn"
                    className="btn-secondary"
                    onClick={() => openModal('login')}
                  >
                    Log in
                  </button>
                  <button
                    id="nav-get-started-btn"
                    className="btn-primary"
                    onClick={() => openModal('signup')}
                  >
                    Get started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

// ── Hero Section ──
function HeroSection() {
  const [selectedSlot, setSelectedSlot] = useState(2)
  const [showModal, setShowModal] = useState(false)
  const [heroScreenHint, setHeroScreenHint] = useState('signup')
  const { loginWithRedirect } = useAuth0()
  const slots = [
    { time: '9:00 AM', booked: false },
    { time: '9:30 AM', booked: true  },
    { time: '10:00 AM', booked: false },
    { time: '10:30 AM', booked: false },
    { time: '11:00 AM', booked: true  },
    { time: '11:30 AM', booked: false },
    { time: '2:00 PM', booked: false },
    { time: '2:30 PM', booked: false },
  ]

  const openHeroModal = (hint = 'signup') => {
    setHeroScreenHint(hint)
    setShowModal(true)
  }

  const handleRoleSelect = (role) => {
    localStorage.setItem('pendingRole', role)
    setShowModal(false)
    loginWithRedirect({ authorizationParams: { screen_hint: heroScreenHint } })
  }

  return (
    <>
      {showModal && (
        <RolePickerModal
          onSelect={handleRoleSelect}
          onClose={() => setShowModal(false)}
        />
      )}
      <section className="hero" aria-label="Hero section">
        {/* Background blobs */}
        <div className="hero-blobs" aria-hidden="true">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-blob hero-blob-3" />
        </div>

        <div className="container">
          <div className="hero-grid">
            {/* Left content */}
            <div className="hero-content">
              <div className="hero-eyebrow">
                <BadgePill>MedaVida Hackathon 2024</BadgePill>
              </div>

              <h1 className="hero-headline">
                Schedule smarter.<br />
                <span className="accent">Zero conflicts.</span>
              </h1>

              <p className="hero-sub">
                MedaBook makes booking a doctor appointment as easy as picking a time. Doctors stay in control of their schedule and patients always see the right time, wherever they are.
              </p>

              <div className="hero-actions">
                <button
                  className="btn-hero-primary"
                  id="hero-book-now-btn"
                  onClick={() => openHeroModal('signup')}
                >
                  Book an appointment
                  <Icon name="arrowRight" size={18} />
                </button>
                <button
                  className="btn-hero-secondary"
                  id="hero-doctor-btn"
                  onClick={() => openHeroModal('signup')}
                >
                  <Icon name="play" size={16} />
                  Doctor portal
                </button>
              </div>

              <div className="hero-stats" role="list" aria-label="Key statistics">
                {[
                  { num: '3', label: 'Time zones supported' },
                  { num: '2h', label: 'Cancellation window' },
                  { num: '∞', label: 'Bookings possible' },
                ].map((s, i) => (
                  <div key={i} className="hero-stat" role="listitem">
                    <span className="hero-stat-num">{s.num}</span>
                    <span className="hero-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

          {/* Right visual */}
          <div className="hero-visual" aria-hidden="true">
            {/* Floating confirmation badge */}
            <div className="hero-float-card hero-float-card-1">
              <div className="float-icon green">
                <Icon name="check" size={16} color="#15803d" />
              </div>
              Booking confirmed
            </div>

            {/* Main card */}
            <div className="hero-card-main" role="presentation">
              <div className="hero-card-header">
                <div className="hero-card-avatar">🩺</div>
                <div>
                  <div className="hero-card-name">Dr. Meera Sharma</div>
                  <div className="hero-card-spec">Cardiologist · London</div>
                </div>
                <span className="hero-card-badge">Available</span>
              </div>

              <div className="hero-slots-label">Select a slot · Thursday 28 Nov</div>
              <div className="hero-slots-grid">
                {slots.map((slot, i) => (
                  <button
                    key={i}
                    className={`hero-slot${i === selectedSlot ? ' selected' : ''}${slot.booked ? ' booked' : ''}`}
                    onClick={() => !slot.booked && setSelectedSlot(i)}
                    aria-label={`${slot.time}${slot.booked ? ' booked' : ''}`}
                    aria-pressed={i === selectedSlot}
                    disabled={slot.booked}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>

              <div className="hero-slots-label" style={{ marginTop: 0 }}>Same instant, three zones</div>
              <div className="hero-tz-row">
                {[
                  { zone: 'IST', time: '3:30 PM' },
                  { zone: 'GMT', time: '10:00 AM' },
                  { zone: 'EST', time: '5:00 AM' },
                ].map((tz, i) => (
                  <div key={i} className="hero-tz-chip">
                    <div className="hero-tz-name">{tz.zone}</div>
                    <div className="hero-tz-time">{tz.time}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating info card */}
            <div className="hero-float-card hero-float-card-2">
              <div className="float-icon blue">
                <Icon name="clock" size={14} color="#1d4ed8" />
              </div>
              Only one patient can book a slot at a time
            </div>
          </div>
        </div>
      </div>
    </section>
  </>
  )
}

// ── How It Works Section ──
function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      icon: 'users',
      title: 'Create your account',
      desc: 'Sign up in seconds as a patient or a doctor and get your own personal dashboard right away.',
    },
    {
      num: '02',
      icon: 'calendar',
      title: 'Browse and pick a time',
      desc: 'Browse available doctors, see their open times in your own timezone, and pick what works for you.',
    },
    {
      num: '03',
      icon: 'check',
      title: 'Confirmed instantly',
      desc: 'Your booking is secured the moment you confirm. Even if two people choose the same time, only one gets it. No surprises.',
    },
  ]

  return (
    <section className="how-section" id="how-it-works" aria-labelledby="how-heading">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-eyebrow">
            <BadgePill>Simple flow</BadgePill>
          </div>
          <h2 className="section-heading" id="how-heading">From browsing to booked in seconds</h2>
          <p className="section-sub">
            Three clear steps and you are done. No phone calls, no back and forth, no surprises.
          </p>
        </div>

        <div className="how-grid">
          {steps.map((step, i) => (
            <article
              key={i}
              className={`how-card reveal reveal-delay-${i + 2}`}
              aria-labelledby={`how-step-${i}-title`}
            >
              <div className="how-step-num" aria-hidden="true">{step.num}</div>
              <div className="how-icon-box">
                <Icon name={step.icon} size={22} color="var(--brand-600)" />
              </div>
              <h3 className="how-title" id={`how-step-${i}-title`}>{step.title}</h3>
              <p className="how-desc">{step.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Features Section ──
function FeaturesSection() {
  const features = [
    { icon: 'lock',       color: 'blue',   title: 'No double bookings',        desc: 'Two patients cannot take the same slot even if they click at the exact same moment. Only one gets it.' },
    { icon: 'globe',      color: 'green',  title: 'Three time zones',          desc: 'India, UK, and US time zones all work seamlessly. Patients always see appointment times in their own local time.' },
    { icon: 'shield',     color: 'indigo', title: 'Secure by design',          desc: 'Patients can only see and manage their own appointments. Doctors can only access their own schedule.' },
    { icon: 'calendar',   color: 'yellow', title: 'Always up to date',         desc: 'Available times are shown live based on what the doctor has open right now. Nothing is hardcoded.' },
    { icon: 'xCircle',    color: 'rose',   title: 'Easy cancellation',         desc: 'Cancel any appointment up to two hours before it starts. The time slot opens up for someone else right away.' },
    { icon: 'repeat',     color: 'teal',   title: 'Hassle free rescheduling',  desc: 'Move your appointment to another time with confidence. If the new time is gone, your original one is kept safe.' },
    { icon: 'activity',   color: 'purple', title: 'Full booking history',      desc: 'A clear record of every appointment booked, changed, or cancelled is always available to you.' },
    { icon: 'smartphone', color: 'sky',    title: 'Works on any device',       desc: 'Patients check their next appointment at a glance. Doctors see their full day clearly, even on a phone.' },
  ]

  return (
    <section className="features-section" id="features" aria-labelledby="features-heading">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-eyebrow">
            <BadgePill>Full feature set</BadgePill>
          </div>
          <h2 className="section-heading" id="features-heading">Everything you need, nothing you do not</h2>
          <p className="section-sub">
            Every part of the booking experience is smooth, fair, and frustration free for both doctors and patients.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <article
              key={i}
              className={`feature-card reveal reveal-delay-${(i % 4) + 1}`}
              aria-labelledby={`feature-${i}-title`}
            >
              <div className={`feature-icon-box ${f.color}`}>
                <Icon name={f.icon} size={18} color="currentColor" />
              </div>
              <h3 className="feature-title" id={`feature-${i}-title`}>{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Roles Section ──
function RolesSection() {
  const doctorItems = [
    { icon: 'clock',    title: 'Set working hours',      desc: 'Define daily time ranges in your local timezone. Changes reflect instantly.' },
    { icon: 'calendar', title: 'Block time off',          desc: 'Mark breaks, holidays, and unavailable periods. Existing bookings stay intact.' },
    { icon: 'users',    title: 'View your bookings',      desc: 'See every appointment scheduled with you, never another doctor private data.' },
    { icon: 'activity', title: 'Appointment lengths',     desc: 'Choose 15, 30, or 60 minute slots to match your practice style.' },
  ]

  const patientItems = [
    { icon: 'search',   title: 'Discover doctors',        desc: 'Filter by name, specialization, or availability across all registered doctors.' },
    { icon: 'calendar', title: 'Book a slot',             desc: 'Pick any open time shown in your own timezone and confirm in one click.' },
    { icon: 'repeat',   title: 'Reschedule if needed',    desc: 'Move an appointment to any open slot. Your original booking is protected if the new one fails.' },
    { icon: 'bell',     title: 'Cancel with notice',      desc: 'Cancel up to two hours before the appointment and the slot opens for others.' },
  ]

  const RoleCard = ({ icon, emoji, colorClass, title, sub, items, cardId }) => (
    <article className="role-card" id={cardId} aria-labelledby={`${cardId}-title`}>
      <div className={`role-icon ${colorClass}`} aria-hidden="true">{emoji}</div>
      <h3 className="role-title" id={`${cardId}-title`}>{title}</h3>
      <p className="role-sub">{sub}</p>
      <ul className="role-list" role="list">
        {items.map((item, idx) => (
          <li key={idx}>
            <div className="role-list-item">
              <div className="role-list-icon">
                <Icon name={item.icon} size={16} color="var(--brand-600)" />
              </div>
              <div className="role-list-content">
                <div className="role-list-title">{item.title}</div>
                <div className="role-list-desc">{item.desc}</div>
              </div>
            </div>
            {idx < items.length - 1 && <div className="role-connector" aria-hidden="true" />}
          </li>
        ))}
      </ul>
    </article>
  )

  return (
    <section className="roles-section" id="for-doctors" aria-labelledby="roles-heading">
      <div className="container">
        <div className="section-header reveal">
          <div className="section-eyebrow">
            <BadgePill>Two roles, one platform</BadgePill>
          </div>
          <h2 className="section-heading" id="roles-heading">Built for both sides of the appointment</h2>
          <p className="section-sub">
            Doctors stay in control of their calendar. Patients get a simple, clear booking experience. Everyone sees only what is relevant to them.
          </p>
        </div>

        <div className="roles-grid">
          <div className="reveal reveal-delay-1">
            <RoleCard
              cardId="doctor-role-card"
              emoji="🩺"
              colorClass="doctor"
              title="For Doctors"
              sub="Take full control of your schedule without wrestling with a spreadsheet or accepting calls."
              items={doctorItems}
            />
          </div>
          <div className="reveal reveal-delay-2">
            <RoleCard
              cardId="patient-role-card"
              emoji="👤"
              colorClass="patient"
              title="For Patients"
              sub="Find the right doctor, pick a time that works for you, and manage your appointments from anywhere."
              items={patientItems}
            />
          </div>
        </div>
      </div>
    </section>
  )
}



// ── CTA Section ──
function CTASection() {
  const { loginWithRedirect } = useAuth0()

  return (
    <section className="cta-section" aria-labelledby="cta-heading">
      <div className="cta-blob cta-blob-1" aria-hidden="true" />
      <div className="cta-blob cta-blob-2" aria-hidden="true" />
      <div className="container">
        <div className="cta-inner reveal">
          <h2 className="cta-heading" id="cta-heading">
            Ready to book your first<br />conflict free appointment?
          </h2>
          <p className="cta-sub">
            Join as a doctor to set your schedule or as a patient to find and book a slot in your timezone.
          </p>
          <div className="cta-actions">
            <button
              className="btn-cta-primary"
              id="cta-patient-btn"
              onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
            >
              Book as a patient
              <Icon name="arrowRight" size={18} />
            </button>
            <button
              className="btn-cta-secondary"
              id="cta-doctor-btn"
              onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
            >
              Join as a doctor
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Footer ──
function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div className="footer-brand-name">MedaBook</div>
            <p className="footer-brand-tag">The smart way to book and manage medical appointments across any timezone.</p>
          </div>

          <div className="footer-links">
            <div>
              <div className="footer-col-title">Product</div>
              <ul className="footer-col-links" role="list">
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How it works</a></li>
                <li><a href="#for-doctors">For doctors</a></li>
                <li><a href="#for-patients">For patients</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Account</div>
              <ul className="footer-col-links" role="list">
                <li><a href="/login">Log in</a></li>
                <li><a href="/register?role=patient">Patient signup</a></li>
                <li><a href="/register?role=doctor">Doctor signup</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">2024 MedaBook. MedaVida Hackathon entry.</span>
          <span className="footer-medavida">
            Built with <span className="footer-heart">♥</span> for MedaVida
          </span>
        </div>
      </div>
    </footer>
  )
}

// ── Intersection Observer hook ──
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

// ── Main Landing Page ──
export default function LandingPage() {
  useReveal()

  return (
    <>
      <Nav />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <RolesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
