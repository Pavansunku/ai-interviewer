import { useState, useRef, useCallback, useEffect } from 'react'
import useSpeechSynthesis from './useSpeechSynthesis'
import { synthesizeSpeech } from '../api/voiceApi'
import { splitIntoChunks } from '../utils/splitText'

// Orpheus takes at most 200 characters per request
const GROQ_CHUNK_CHARS = 190

// Shared across mounts. After a Groq failure the browser voice takes over:
// for a couple of minutes on a rate limit, for the rest of the page session otherwise
// (quota exhausted, terms not accepted, TTS disabled on the server).
let groqDisabledUntil = 0
const RATE_LIMIT_BACKOFF_MS = 2 * 60 * 1000

function silentWavUrl() {
  const samples = 800 // 0.1s of silence at 8 kHz, 16-bit mono
  const buf = new ArrayBuffer(44 + samples * 2)
  const view = new DataView(buf)
  const ascii = (offset, str) => [...str].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)))
  ascii(0, 'RIFF'); view.setUint32(4, 36 + samples * 2, true); ascii(8, 'WAVE')
  ascii(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, 8000, true); view.setUint32(28, 16000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true)
  ascii(36, 'data'); view.setUint32(40, samples * 2, true)
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
}

/**
 * useGroqSpeech
 * Speaks text with Groq's Orpheus voice, falling back to the browser's
 * SpeechSynthesis (useSpeechSynthesis) whenever Groq can't be used.
 * Same contract as useSpeechSynthesis, plus `unlock`.
 *
 * Text is split into ≤190-character chunks; chunk n+1 is fetched while chunk n plays.
 *
 * Returns:
 *   supported   – always true (the browser voice is the fallback)
 *   isSpeaking  – boolean
 *   speak(text, { onEnd, rate, pitch, volume }) – rate/pitch/volume apply to the browser voice
 *   stop()      – cancel current speech
 *   unlock()    – call inside a click handler so later playback is allowed (Safari)
 */
export default function useGroqSpeech() {
  const {
    isSpeaking: browserSpeaking,
    speak: browserSpeak,
    stop: browserStop,
  } = useSpeechSynthesis()

  const [groqSpeaking, setGroqSpeaking] = useState(false)
  const audioRef = useRef(null)
  const runRef = useRef(0) // bumped by every speak()/stop(); callbacks from older runs bail out
  const controllerRef = useRef(null)
  const urlsRef = useRef([])

  const getAudio = () => {
    if (!audioRef.current) audioRef.current = new Audio()
    return audioRef.current
  }

  const release = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    urlsRef.current = []
    const audio = audioRef.current
    if (audio) {
      audio.onended = null
      audio.onerror = null
      audio.pause()
    }
  }, [])

  useEffect(() => {
    return () => {
      runRef.current += 1
      release()
    }
  }, [release])

  const stop = useCallback(() => {
    runRef.current += 1
    release()
    setGroqSpeaking(false)
    browserStop()
  }, [release, browserStop])

  const speak = useCallback(
    (text, { onEnd, rate, pitch, volume } = {}) => {
      stop()
      if (!text) {
        onEnd?.()
        return
      }

      const browserOptions = { onEnd, rate, pitch, volume }
      if (Date.now() < groqDisabledUntil) {
        browserSpeak(text, browserOptions)
        return
      }

      const run = runRef.current
      const isCurrent = () => run === runRef.current
      const chunks = splitIntoChunks(text, GROQ_CHUNK_CHARS)
      const controller = new AbortController()
      controllerRef.current = controller

      const fetchChunk = (i) => {
        const pending = synthesizeSpeech(chunks[i], controller.signal).then((blob) => {
          if (!isCurrent()) return null // stopped meanwhile — don't create a URL nobody revokes
          const url = URL.createObjectURL(blob)
          urlsRef.current.push(url)
          return url
        })
        pending.catch(() => {}) // handled where it is awaited; avoids an unhandled rejection
        return pending
      }

      // Hand whatever is left of the text to the browser voice. Ending the run first
      // makes this a one-time transition even if several failure paths fire.
      const fallBack = (fromIndex, err) => {
        if (!isCurrent()) return
        runRef.current += 1
        console.warn('Groq TTS unavailable, using the browser voice:', err?.message || err)
        groqDisabledUntil = err?.status === 429 ? Date.now() + RATE_LIMIT_BACKOFF_MS : Infinity
        release()
        setGroqSpeaking(false)
        browserSpeak(chunks.slice(fromIndex).join(' '), browserOptions)
      }

      const playFrom = async (i, pending) => {
        if (!isCurrent()) return
        if (i >= chunks.length) {
          runRef.current += 1 // settle the run before handing control back
          release()
          setGroqSpeaking(false)
          onEnd?.()
          return
        }

        let url
        try {
          url = await pending
        } catch (err) {
          if (!err?.canceled) fallBack(i, err)
          return
        }
        if (!isCurrent()) return

        const next = i + 1 < chunks.length ? fetchChunk(i + 1) : null
        const audio = getAudio()
        audio.onended = () => playFrom(i + 1, next)
        audio.onerror = () => fallBack(i, new Error('Audio playback failed'))
        audio.src = url
        try {
          await audio.play()
        } catch (err) {
          // AbortError means a newer speak()/stop() replaced this source — not a failure
          if (err?.name !== 'AbortError') fallBack(i, err)
        }
      }

      setGroqSpeaking(true)
      playFrom(0, fetchChunk(0))
    },
    [stop, release, browserSpeak]
  )

  const unlock = useCallback(() => {
    const audio = getAudio()
    const url = silentWavUrl()
    audio.src = url
    audio
      .play()
      .catch(() => {})
      .finally(() => URL.revokeObjectURL(url))
  }, [])

  return { supported: true, isSpeaking: groqSpeaking || browserSpeaking, speak, stop, unlock }
}
