import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'

/**
 * Reusable minimal flat Select dropdown
 *
 * Props:
 *   id          - HTML id
 *   label       - Optional label
 *   value       - Currently selected value
 *   onChange    - Callback fn(value)
 *   options     - Array of strings OR array of { value, label, sublabel }
 *                 OR array of groups: { group: 'Title', options: [...] }
 *   placeholder - Placeholder text
 *   searchable  - boolean (enables search filtering for long lists)
 *   error       - Error message string
 *   disabled    - boolean
 */
export default function Select({
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option…',
  searchable = false,
  error,
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Closing the menu also clears the search box
  const closeMenu = () => {
    setIsOpen(false)
    setSearchQuery('')
  }
  const containerRef = useRef(null)
  const searchInputRef = useRef(null)

  // Normalize options into groups or flat list
  const isGrouped = options.length > 0 && typeof options[0] === 'object' && 'group' in options[0]

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeMenu()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  // Get current selected item label
  const getSelectedLabel = () => {
    if (!value) return null

    if (isGrouped) {
      for (const group of options) {
        for (const opt of group.options) {
          const optVal = typeof opt === 'object' ? opt.value : opt
          const optLabel = typeof opt === 'object' ? opt.label : opt
          if (optVal === value) return optLabel
        }
      }
    } else {
      for (const opt of options) {
        const optVal = typeof opt === 'object' ? opt.value : opt
        const optLabel = typeof opt === 'object' ? opt.label : opt
        if (optVal === value) return optLabel
      }
    }
    return value
  }

  // Filter options based on search query
  const filterOptions = () => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return options

    if (isGrouped) {
      return options
        .map((group) => ({
          ...group,
          options: group.options.filter((opt) => {
            const label = typeof opt === 'object' ? opt.label : opt
            const sub = typeof opt === 'object' && opt.sublabel ? opt.sublabel : ''
            return label.toLowerCase().includes(query) || sub.toLowerCase().includes(query)
          }),
        }))
        .filter((group) => group.options.length > 0)
    }

    return options.filter((opt) => {
      const label = typeof opt === 'object' ? opt.label : opt
      const sub = typeof opt === 'object' && opt.sublabel ? opt.sublabel : ''
      return label.toLowerCase().includes(query) || sub.toLowerCase().includes(query)
    })
  }

  const filteredOptions = filterOptions()

  const handleSelect = (val) => {
    onChange?.(val)
    closeMenu()
  }

  const selectedLabel = getSelectedLabel()

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          if (isOpen) closeMenu()
          else setIsOpen(true)
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={[
          'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-md text-xs font-normal text-left transition-colors',
          'bg-[#121214] border',
          error
            ? 'border-red-500/80 focus:border-red-500'
            : isOpen
            ? 'border-zinc-400 bg-[#151518]'
            : 'border-[#27272a] hover:border-zinc-600',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span className={selectedLabel ? 'text-zinc-100 font-medium' : 'text-zinc-500'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-150 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Error message */}
      {error && <p className="text-red-400 text-xs mt-1.5 font-mono">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 mt-1.5 w-full rounded-md bg-[#121214] border border-[#27272a] shadow-2xl max-h-72 overflow-y-auto py-1 scrollbar-thin"
        >
          {/* Optional Search bar */}
          {searchable && (
            <div className="p-2 border-b border-[#27272a] sticky top-0 bg-[#121214] z-10">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Filter options…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#18181b] border border-[#27272a] rounded text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>
          )}

          {/* Grouped or Flat list */}
          {isGrouped ? (
            filteredOptions.length > 0 ? (
              filteredOptions.map((group) => (
                <div key={group.group} className="py-1">
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold bg-[#0d0d0f]/60">
                    {group.group}
                  </div>
                  {group.options.map((opt) => {
                    const optVal = typeof opt === 'object' ? opt.value : opt
                    const optLabel = typeof opt === 'object' ? opt.label : opt
                    const optSub = typeof opt === 'object' ? opt.sublabel : null
                    const isSelected = value === optVal

                    return (
                      <button
                        key={optVal}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(optVal)}
                        className={[
                          'w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors',
                          isSelected
                            ? 'bg-[#1e1e24] text-white font-medium'
                            : 'text-zinc-300 hover:bg-[#18181b] hover:text-white',
                        ].join(' ')}
                      >
                        <div className="flex flex-col">
                          <span>{optLabel}</span>
                          {optSub && (
                            <span className="text-[11px] text-zinc-500 font-normal">{optSub}</span>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-zinc-500">No matching roles found</div>
            )
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const optVal = typeof opt === 'object' ? opt.value : opt
              const optLabel = typeof opt === 'object' ? opt.label : opt
              const optSub = typeof opt === 'object' ? opt.sublabel : null
              const isSelected = value === optVal

              return (
                <button
                  key={optVal}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(optVal)}
                  className={[
                    'w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors',
                    isSelected
                      ? 'bg-[#1e1e24] text-white font-medium'
                      : 'text-zinc-300 hover:bg-[#18181b] hover:text-white',
                  ].join(' ')}
                >
                  <div className="flex flex-col">
                    <span>{optLabel}</span>
                    {optSub && (
                      <span className="text-[11px] text-zinc-500 font-normal">{optSub}</span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                </button>
              )
            })
          ) : (
            <div className="p-3 text-center text-xs text-zinc-500">No matching options found</div>
          )}
        </div>
      )}
    </div>
  )
}
