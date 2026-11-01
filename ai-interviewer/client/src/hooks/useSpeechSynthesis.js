import { useState, useRef, useCallback, useEffect } from 'react'
import { splitIntoChunks } from '../utils/splitText'

/**
 * useSpeechSynthesis
 * Wraps the browser's SpeechSynthesis API to make the AI speak.
 *
 * KEY FIX: Chrome has a well-known bug where SpeechSynthesis silently stops
 * after ~15 seconds for long texts. We fix this by:
 * 1. Splitting text into sentence-sized chunks
 * 2. Speaking each chunk as its own utterance, chained via onend
 * 3. Running a keep-alive interval (Chrome pauses synthesis when tab is inactive)
 *
 * Returns:
 *   supported   – boolean
 *   isSpeaking  – boolean
 *   speak(text, { onEnd, rate, pitch, volume }) – speak a string
 *   stop()      – cancel current speech
 */
export default function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Internal state for chunked playback. Every speak()/stop() bumps runRef; callbacks
  // (utterance events, the voices timer) from an older run see a stale id and bail out.
  const runRef = useRef(0)
  const keepAliveRef = useRef(null)
  const voicesTimerRef = useRef(null)

  const clearTimers = () => {
    if (keepAliveRef.current) clearInterval(keepAliveRef.current)
    if (voicesTimerRef.current) clearTimeout(voicesTimerRef.current)
    keepAliveRef.current = null
    voicesTimerRef.current = null
  }

  // Cancel any speech on unmount
  useEffect(() => {
    return () => {
      runRef.current += 1
      clearTimers()
      if (supported) window.speechSynthesis.cancel()
    }
  }, [supported])

  const getVoice = useCallback(() => {
    if (!supported) return null
    const voices = window.speechSynthesis.getVoices()
    return (
      voices.find((v) => v.name.includes('Google UK English Female')) ||
      voices.find((v) => v.name.includes('Google US English')) ||
      voices.find((v) => v.lang === 'en-US' && !v.localService) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0] ||
      null
    )
  }, [supported])

  const speak = useCallback(
    (text, { onEnd, rate = 1.0, pitch = 1.0, volume = 1.0 } = {}) => {
      if (!supported || !text) {
        onEnd?.()
        return
      }

      // Cancel any ongoing speech
      const run = ++runRef.current
      const isActive = () => run === runRef.current
      clearTimers()
      window.speechSynthesis.cancel()

      const chunks = splitIntoChunks(text, 200)
      let chunkIndex = 0
      setIsSpeaking(true)

      // Chrome keep-alive: periodically pause/resume to prevent silent stop
      keepAliveRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause()
          window.speechSynthesis.resume()
        }
      }, 10000)

      const speakChunk = () => {
        // If cancelled externally or replaced by a newer speak(), stop chain
        if (!isActive()) return

        if (chunkIndex >= chunks.length) {
          // All chunks done
          runRef.current += 1
          setIsSpeaking(false)
          clearTimers()
          onEnd?.()
          return
        }

        const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex++])
        utterance.rate = rate
        utterance.pitch = pitch
        utterance.volume = volume

        const voice = getVoice()
        if (voice) utterance.voice = voice

        utterance.onend = () => {
          if (!isActive()) return
          speakChunk()
        }

        utterance.onerror = (e) => {
          if (!isActive()) return
          // 'interrupted' is expected when stop() is called — don't chain
          if (e.error === 'interrupted' || e.error === 'canceled') return
          console.warn('SpeechSynthesis error on chunk:', e.error)
          // Skip broken chunk and continue
          speakChunk()
        }

        window.speechSynthesis.speak(utterance)
      }

      // Voices may not be loaded yet on first call — wait for them, but only briefly:
      // some browsers (e.g. Chromium on Linux without speech-dispatcher) never load
      // any, and waiting forever would stall the interview
      if (window.speechSynthesis.getVoices().length === 0) {
        let started = false
        const begin = () => {
          if (started) return
          started = true
          window.speechSynthesis.onvoiceschanged = null
          speakChunk()
        }
        window.speechSynthesis.onvoiceschanged = begin
        voicesTimerRef.current = setTimeout(begin, 1000)
      } else {
        speakChunk()
      }
    },
    [supported, getVoice]
  )

  const stop = useCallback(() => {
    if (!supported) return
    runRef.current += 1
    clearTimers()
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [supported])

  return { supported, isSpeaking, speak, stop }
}
