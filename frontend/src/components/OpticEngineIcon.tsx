export function OpticEngineIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eab308" stopOpacity="1" />
          <stop offset="100%" stopColor="#ca8a04" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="16" cy="16" r="16" fill="url(#iconGrad)" />

      {/* Camera lens outer ring */}
      <circle cx="16" cy="16" r="12" fill="none" stroke="#000000" strokeWidth="1.5" opacity="0.9" />

      {/* Camera lens inner circle */}
      <circle cx="16" cy="16" r="8" fill="#000000" opacity="0.15" />

      {/* Shutter blades */}
      <g fill="#000000" opacity="0.95">
        <path d="M16 8 L18 12 L14 12 Z" />
        <path d="M24 16 L20 18 L20 14 Z" />
        <path d="M16 24 L14 20 L18 20 Z" />
        <path d="M8 16 L12 14 L12 18 Z" />
      </g>

      {/* Center dot */}
      <circle cx="16" cy="16" r="2" fill="#000000" />

      {/* Network nodes (subtle) */}
      <circle cx="16" cy="4" r="1.5" fill="#000000" opacity="0.6" />
      <circle cx="28" cy="16" r="1.5" fill="#000000" opacity="0.6" />
      <circle cx="16" cy="28" r="1.5" fill="#000000" opacity="0.6" />
      <circle cx="4" cy="16" r="1.5" fill="#000000" opacity="0.6" />
    </svg>
  )
}
