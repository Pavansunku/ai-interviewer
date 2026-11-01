import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useAntiCheat
 *
 * Detects cheating behaviors during an interview session:
 *  - Tab switching / window minimizing (visibilitychange)
 *  - Window losing focus to another app (blur)
 *  - Right-click context menu
 *  - Text selection on the page
 *  - Keyboard shortcuts that could help cheat (Alt+Tab signal via blur)
 *  - Browser back button (trapped via pushState)
 *  - Page refresh / close (beforeunload warning)
 *
 * @param {boolean} enabled      - Only active when true (after interview starts)
 * @param {number}  maxViolations - Violations before auto-disqualify (default 3)
 * @param {Function} onDisqualify - Callback when max violations reached
 *
 * Returns: { violations, showWarning, dismissWarning, maxViolations }
 */
export default function useAntiCheat({
  enabled = false,
  maxViolations = 3,
  onDisqualify,
} = {}) {
  const [violations, setViolations] = useState(0)
  const [showWarning, setShowWarning] = useState(false)
  const [warningReason, setWarningReason] = useState('')
  const violationsRef = useRef(0)
  const enabledRef = useRef(enabled)

  // Keep ref in sync so event handlers always see the latest value
  useEffect(() => {
    enabledRef.current = enabled
  }, [enabled])

  const recordViolation = useCallback(
    (reason) => {
      if (!enabledRef.current) return
      violationsRef.current += 1
      setViolations(violationsRef.current)
      setWarningReason(reason)
      setShowWarning(true)
      if (violationsRef.current >= maxViolations) {
        onDisqualify?.()
      }
    },
    [maxViolations, onDisqualify]
  )

  useEffect(() => {
    if (!enabled) return

    // ── 1. Tab switch / window minimize ──────────────────────────────────────
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('tab_switch')
      }
    }

    // ── 2. Window blur (switched to another app) ─────────────────────────────
    // Only fire if the document is NOT already hidden (visibilitychange handles that case)
    const handleBlur = () => {
      if (!document.hidden) {
        recordViolation('window_blur')
      }
    }

    // ── 3. Block right-click ──────────────────────────────────────────────────
    const handleContextMenu = (e) => {
      if (enabledRef.current) e.preventDefault()
    }

    // ── 4. Block text selection ───────────────────────────────────────────────
    const handleSelectStart = (e) => {
      if (enabledRef.current) e.preventDefault()
    }

    // ── 5. Block copy (Ctrl+C / Cmd+C) ───────────────────────────────────────
    const handleCopy = (e) => {
      if (enabledRef.current) e.preventDefault()
    }

    // ── 6. Warn on page close / refresh ──────────────────────────────────────
    const handleBeforeUnload = (e) => {
      if (!enabledRef.current) return
      e.preventDefault()
      e.returnValue = 'Interview in progress — leaving will end your session.'
      return e.returnValue
    }

    // ── 7. Block browser back button ──────────────────────────────────────────
    // Push a dummy history state; when user hits back, we push again to trap them.
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      if (enabledRef.current) {
        window.history.pushState(null, '', window.location.href)
        recordViolation('back_button')
      }
    }

    // ── 8. Fullscreen exit ───────────────────────────────────────────────────
    const handleFullscreenChange = () => {
      if (enabledRef.current && !document.fullscreenElement) {
        recordViolation('fullscreen_exit')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('selectstart', handleSelectStart)
    document.addEventListener('copy', handleCopy)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('copy', handleCopy)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [enabled, recordViolation])

  const dismissWarning = useCallback(() => {
    setShowWarning(false)
    if (enabledRef.current && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => console.warn(err))
    }
  }, [])

  return {
    violations,
    showWarning,
    warningReason,
    dismissWarning,
    maxViolations,
    remaining: Math.max(0, maxViolations - violations),
  }
}
