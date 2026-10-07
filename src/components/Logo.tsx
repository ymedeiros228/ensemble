export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b8cff" />
          <stop offset="1" stopColor="#1f4fd8" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="24" r="8" fill="url(#lg)" />
      <circle cx="43" cy="22" r="7" fill="url(#lg)" opacity="0.85" />
      <path d="M6 36c4 14 14 20 27 19 11-1 20-9 25-22-6 8-14 12-24 12-12 0-19-3-28-9z" fill="url(#lg)" />
      <path d="M34 4l1.8 4.2L40 10l-4.2 1.8L34 16l-1.8-4.2L28 10l4.2-1.8z" fill="#2f6bf2" />
      <path d="M52 8l1 2.4 2.4 1-2.4 1L52 15l-1-2.6-2.4-1 2.4-1z" fill="#5b8cff" />
    </svg>
  );
}

export function Logo({ size = 40, text = true }: { size?: number; text?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} />
      {text && (
        <span className="text-ink font-extrabold tracking-tight" style={{ fontSize: size * 0.82 }}>
          ensemble
        </span>
      )}
    </span>
  );
}
