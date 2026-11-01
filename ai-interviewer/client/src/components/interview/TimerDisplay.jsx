import { useEffect, useRef, useState } from 'react'
import { Clock } from 'lucide-react'

/**
 * Counts down from `initialSeconds`. Calls onExpire when time runs out.
 */
export default function TimerDisplay({ initialSeconds, onExpire, className = '' }) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const isWarning = secondsLeft <= 60
  const isCritical = secondsLeft <= 30

  return (
    <div
      className={[
        'flex items-center gap-2 px-3 py-1 rounded-md border font-mono text-xs tabular-nums tracking-wide transition-colors',
        isCritical
          ? 'bg-red-950/20 border-red-900/50 text-red-400'
          : isWarning
            ? 'bg-amber-950/20 border-amber-900/50 text-amber-400'
            : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa]',
        className,
      ].join(' ')}
    >
      <Clock className="w-3.5 h-3.5 opacity-70" />
      <span>{formatted}</span>
    </div>
  )
}
