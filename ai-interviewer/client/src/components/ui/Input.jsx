import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, className = '', id, type = 'text', ...rest },
  ref
) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-[#a1a1aa]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        type={type}
        className={[
          'w-full rounded-lg bg-[#121214] border text-[#f4f4f5] placeholder-[#52525b]',
          'px-3.5 py-2.5 text-sm outline-none transition-colors duration-150',
          'focus:border-[#52525b] focus:ring-1 focus:ring-[#52525b]',
          error
            ? 'border-red-500/50 focus:border-red-500'
            : 'border-[#27272a] hover:border-[#3f3f46]',
          className,
        ].join(' ')}
        {...rest}
      />
      {error && <p className="text-xs text-red-400 mt-0.5">{error}</p>}
    </div>
  )
})

export default Input
