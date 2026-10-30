import type { CSSProperties } from 'react'

export function Countdown({ deadline, now, duration }: {
  deadline: number | null
  now: number
  duration: number
}) {
  const seconds = Math.max(0, Math.ceil(((deadline ?? now) - now) / 1000))
  const progress = Math.max(0, Math.min(1, ((deadline ?? now) - now) / (duration * 1000)))
  return (
    <div
      className={`timer ${seconds <= 3 ? 'timer-urgent' : ''}`}
      style={{ '--timer-progress': `${progress * 100}%` } as CSSProperties}
      role="timer"
      aria-label={`${seconds} seconds remaining`}
    >
      <span>
        <strong key={seconds}>{String(seconds).padStart(2, '0')}</strong>
        <small>SECONDS</small>
      </span>
    </div>
  )
}
