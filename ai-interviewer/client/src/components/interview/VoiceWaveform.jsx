/**
 * VoiceWaveform
 * Renders animated equalizer-style bars that pulse when active.
 * Used to show when the AI is speaking or the user is being heard.
 *
 * Props:
 *   isActive  – boolean  (bars animate when true)
 *   color     – 'indigo' | 'violet' | 'emerald' | 'rose'
 *   barCount  – number of bars (default 12)
 */
export default function VoiceWaveform({ isActive = false, color = 'neutral', barCount = 12 }) {
  const colorMap = {
    neutral: 'bg-zinc-300',
    red: 'bg-red-400',
    amber: 'bg-zinc-300',
    gold: 'bg-zinc-300',
    orange: 'bg-zinc-300',
    rose: 'bg-red-400',
    emerald: 'bg-zinc-300',
    indigo: 'bg-zinc-300',
    violet: 'bg-zinc-300',
  }

  const barColor = colorMap[color] || 'bg-zinc-300'

  return (
    <div
      className="flex items-end justify-center gap-1"
      style={{ height: '28px' }}
      aria-label={isActive ? 'Speaking' : 'Silent'}
      role="img"
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={`w-0.5 rounded-full transition-all ${barColor} ${
            isActive ? 'waveform-bar-minimal' : 'opacity-20'
          }`}
          style={{
            height: isActive ? undefined : '3px',
            animationDelay: isActive ? `${(i * 70) % 400}ms` : '0ms',
            animationDuration: isActive ? `${550 + ((i * 110) % 350)}ms` : '0ms',
          }}
        />
      ))}
    </div>
  )
}
