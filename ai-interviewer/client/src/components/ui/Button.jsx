import { forwardRef } from 'react'

const variants = {
  primary: 'bg-white hover:bg-neutral-200 text-black font-medium border border-transparent active:bg-neutral-300',
  secondary: 'bg-[#18181b] hover:bg-[#27272a] text-[#f4f4f5] border border-[#27272a] active:bg-[#1f1f23]',
  ghost: 'bg-transparent hover:bg-[#18181b] text-[#a1a1aa] hover:text-[#f4f4f5] border border-transparent',
  danger: 'bg-transparent hover:bg-red-500/10 text-red-400 border border-red-500/25',
  success: 'bg-[#18181b] hover:bg-[#27272a] text-green-400 border border-green-500/30',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-sm rounded-lg',
}

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = '',
    onClick,
    type = 'button',
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center gap-2 font-sans transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none outline-none focus-visible:ring-1 focus-visible:ring-white/40',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      ].join(' ')}
      {...rest}
    >
      {isLoading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  )
})

export default Button
