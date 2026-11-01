export default function Card({ children, className = '', hover = false, ...rest }) {
  const base = 'rounded-xl bg-[#121214] border border-[#27272a] p-5 sm:p-6'
  const hoverClass = hover ? 'hover:border-[#3f3f46] hover:bg-[#151518] transition-colors duration-150' : ''

  return (
    <div
      className={[base, hoverClass, className].join(' ')}
      {...rest}
    >
      {children}
    </div>
  )
}
