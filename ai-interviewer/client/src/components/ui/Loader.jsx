export default function Loader({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-2',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={[
          sizes[size],
          'rounded-full border-white/15 border-t-white animate-spin',
        ].join(' ')}
      />
      {text && <p className="text-xs text-[#71717a] font-sans">{text}</p>}
    </div>
  )
}
