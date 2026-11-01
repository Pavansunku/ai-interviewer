const colorMap = {
  default: 'bg-[#18181b] text-[#a1a1aa] border border-[#27272a]',
  neutral: 'bg-[#18181b] text-[#d4d4d8] border border-[#27272a]',
  emerald: 'bg-green-500/10 text-green-400 border border-green-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  red: 'bg-red-500/10 text-red-400 border border-red-500/20',
  slate: 'bg-[#18181b] text-[#a1a1aa] border border-[#27272a]',
  stone: 'bg-[#18181b] text-[#a1a1aa] border border-[#27272a]',
  indigo: 'bg-[#18181b] text-[#d4d4d8] border border-[#27272a]',
  violet: 'bg-[#18181b] text-[#d4d4d8] border border-[#27272a]',
}

export default function Badge({ children, color = 'neutral', className = '' }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-mono font-medium tracking-tight',
        colorMap[color] || colorMap.neutral,
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
