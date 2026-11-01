import { useState, useRef, useCallback, useEffect } from 'react'
import toast from 'react-hot-toast'
import { transcribeAudio } from '../api/voiceApi'

// Chrome/Firefox record webm/opus, Safari records mp4 — Whisper accepts all of them
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']

const RECORDING_SUPPORTED =
  typeof window !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof window.MediaRecorder !== 'undefined'

function pickMimeType() {
  if (!MediaRecorder.isTypeSupported) return ''
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t)) || ''
}

/**
 * useGroqTranscription
 * Records the microphone with MediaRecorder and transcribes the answer with
 * Groq Whisper when recording stops. Works in every modern browser, unlike the
 * Web Speech API. Same shape as the old Web Speech hook, plus `isTranscribing`.
 *
 * Returns:
 *   supported       – false when recording is unavailable or the mic is denied
 *   isListening     – boolean, recording in progress
 *   isTranscribing  – boolean, upload + Whisper in progress
 *   transcript      – text of the last recording
 *   startListening  – async fn() → true once recording has started
 *   stopListening   – fn()  stops recording and starts transcription
 *   resetTranscript – fn()  clears transcript and drops any in-flight result
 */
export default function useGroqTranscription() {
  const [supported, setSupported] = useState(RECORDING_SUPPORTED)
  const [isListening, setIsListening] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')

  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  // Mic permission can take a while; a stop click during that wait cancels the start
  const startingRef = useRef(false)
  const startCanceledRef = useRef(false)
  // Bumped on reset/unmount so a late Whisper response can't overwrite newer state
  const generationRef = useRef(0)
  const uploadAbortRef = useRef(null)
  const unmountedRef = useRef(false)

  const releaseMic = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    unmountedRef.current = false
    return () => {
      unmountedRef.current = true
      generationRef.current += 1
      uploadAbortRef.current?.abort()
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      releaseMic()
    }
  }, [releaseMic])

  const startListening = useCallback(async () => {
    if (!supported || recorderRef.current || startingRef.current) return false

    startingRef.current = true
    startCanceledRef.current = false
    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      })
    } catch (err) {
      console.error('Microphone access failed:', err)
      toast.error('Microphone unavailable — you can type your answer instead.')
      setSupported(false) // switches VoiceControls to the text fallback
      return false
    } finally {
      startingRef.current = false
    }

    if (unmountedRef.current || startCanceledRef.current) {
      stream.getTracks().forEach((track) => track.stop())
      return false
    }

    streamRef.current = stream
    const mimeType = pickMimeType()
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    const chunks = []

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data)
    }

    recorder.onstop = async () => {
      releaseMic()
      recorderRef.current = null
      setIsListening(false)
      if (unmountedRef.current) return

      const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' })
      if (blob.size < 1024) {
        toast.error('No audio was captured — please try again.')
        return
      }

      const generation = generationRef.current
      const controller = new AbortController()
      uploadAbortRef.current = controller
      setIsTranscribing(true)
      try {
        const res = await transcribeAudio(blob, controller.signal)
        if (generation === generationRef.current) setTranscript(res.data.text || '')
      } catch (err) {
        if (generation === generationRef.current && !err.canceled) {
          toast.error(err.message || 'Transcription failed — please record again.')
        }
      } finally {
        if (uploadAbortRef.current === controller) uploadAbortRef.current = null
        if (generation === generationRef.current) setIsTranscribing(false)
      }
    }

    recorderRef.current = recorder
    recorder.start(1000) // emit data every second so long answers aren't held in one buffer
    setIsListening(true)
    return true
  }, [supported, releaseMic])

  const stopListening = useCallback(() => {
    if (startingRef.current) {
      startCanceledRef.current = true // still waiting for mic permission
      return
    }
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
  }, [])

  const resetTranscript = useCallback(() => {
    generationRef.current += 1
    uploadAbortRef.current?.abort()
    setTranscript('')
    setIsTranscribing(false)
  }, [])

  return {
    supported,
    isListening,
    isTranscribing,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  }
}
