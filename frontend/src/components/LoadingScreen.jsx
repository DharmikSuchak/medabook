export default function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="loading-screen">
      <div className="loading-logo">
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#0ea5e9"/>
          <path d="M16 6L7 11v5c0 5.523 3.58 10.208 9 11 5.42-.792 9-5.477 9-11v-5L16 6z"
            fill="white" fillOpacity="0.9"/>
          <path d="M12 16l3 3 5-5" stroke="white" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="loading-logo-text">MedaBook</span>
      </div>
      <div className="loading-spinner" aria-label="Loading" />
      <p className="loading-message">{message}</p>
    </div>
  )
}
