import type { CSSProperties, ReactNode } from 'react'
export type IconName =
  | 'vault'
  | 'coin'
  | 'diamond'
  | 'bomb'
  | 'empty'
  | 'lock'
  | 'arrow'
  | 'users'
  | 'eye'
  | 'clock'
  | 'trophy'
  | 'exit'
  | 'check'
  | 'spark'
  | 'mask'
export function Icon({
  name,
  className = '',
  style,
}: {
  name: IconName
  className?: string
  style?: CSSProperties
}) {
  const paths: Record<IconName, ReactNode> = {
    vault: (
      <>
        <rect x="3" y="3" width="26" height="26" rx="6" />
        <circle cx="16" cy="16" r="7" />
        <circle cx="16" cy="16" r="2" />
        <path d="M16 9v5m0 4v5m-7-7h5m4 0h5M6 10h1m-1 12h1" />
      </>
    ),
    coin: (
      <>
        <ellipse
          cx="16"
          cy="17"
          rx="10"
          ry="12"
          fill="currentColor"
          stroke="none"
          opacity=".22"
        />
        <ellipse
          cx="16"
          cy="15"
          rx="9"
          ry="11"
          fill="currentColor"
          stroke="none"
        />
        <ellipse cx="16" cy="15" rx="6" ry="8" stroke="#9c651b" />
        <path
          d="M18 11h-3a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-3m2-10v12"
          stroke="#9c651b"
          strokeWidth="1.5"
        />
      </>
    ),
    diamond: (
      <>
        <path d="m3 11 6-7h14l6 7-13 18Z" fill="currentColor" stroke="none" />
        <path
          d="m3 11 13 18 13-18M3 11h26M9 4l-1 7 8 18 8-18-1-7M8 11l8-7 8 7"
          stroke="#076d85"
          strokeWidth="1.2"
        />
        <path d="m9 5 6 0-6 5H5Z" fill="#d8ffff" stroke="none" opacity=".7" />
      </>
    ),
    bomb: (
      <>
        <path d="m20 9 2-4 4 2m-1-4 3-1m-1 9 3 1" />
        <path d="m17 8 6 4-2 3-6-4Z" fill="currentColor" />
        <circle cx="14" cy="21" r="10" fill="currentColor" stroke="none" />
        <path d="M8 20a6 6 0 0 1 5-5" stroke="#ffd0d3" />
        <path
          d="m10 24 2-2m0 2-2-2m7 2 2-2m0 2-2-2"
          stroke="#671e35"
          strokeWidth="1.5"
        />
      </>
    ),
    empty: (
      <>
        <rect x="6" y="6" width="20" height="20" rx="5" strokeDasharray="3 4" />
        <path d="M12 16h8" />
      </>
    ),
    lock: (
      <>
        <rect x="7" y="14" width="18" height="14" rx="4" />
        <path d="M11 14V9a5 5 0 0 1 10 0v5m-5 6v3" />
      </>
    ),
    arrow: <path d="M6 16h20m-7-7 7 7-7 7" />,
    users: (
      <>
        <circle cx="12" cy="11" r="5" />
        <path d="M3 27v-3a9 9 0 0 1 18 0v3m1-20a5 5 0 0 1 0 9m2 4a7 7 0 0 1 5 7" />
      </>
    ),
    eye: (
      <>
        <path d="M2 16S7 6 16 6s14 10 14 10-5 10-14 10S2 16 2 16Z" />
        <circle cx="16" cy="16" r="4" />
      </>
    ),
    clock: (
      <>
        <circle cx="16" cy="17" r="11" />
        <path d="M13 2h6m-3 9v7l4 2M25 6l2 2" />
      </>
    ),
    trophy: (
      <>
        <path d="M9 4h14v9a7 7 0 0 1-14 0Zm7 16v8m-6 0h12M9 7H3v5a6 6 0 0 0 7 6M23 7h6v5a6 6 0 0 1-7 6" />
      </>
    ),
    exit: (
      <>
        <path d="M13 4H5v24h8m3-12h14m-6-6 6 6-6 6" />
      </>
    ),
    check: <path d="m7 16 6 6L26 9" />,
    spark: (
      <>
        <path d="m16 2 3 10 10 4-10 3-3 11-4-11-10-3 10-4Z" />
        <path d="m26 2 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="currentColor" />
      </>
    ),
    mask: (
      <>
        <path
          d="M3 12c8 3 18 3 26 0l-2 12-7 2-4-5-4 5-7-2Z"
          fill="currentColor"
          stroke="none"
        />
        <path d="m7 17 5 1m8 0 5-1" stroke="#100e1d" strokeWidth="3" />
        <path d="M6 11 9 4h14l3 7Z" fill="currentColor" stroke="none" />
      </>
    ),
  }
  return (
    <svg
      className={`icon ${className}`}
      style={style}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
