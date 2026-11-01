export default function ProgressBar({ current, total, className = '' }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-center text-xs font-mono">
        <span className="text-[#71717a]">Progress</span>
        <span className="text-[#a1a1aa]">{current} of {total}</span>
      </div>
      <div className="h-1 bg-[#27272a] rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
