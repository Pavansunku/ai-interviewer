import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * useCamera
 *
 * Opens the user's webcam for a live self-view during the interview.
 * The video stays in the browser: it is never recorded, uploaded or sent to the server.
 *
 * status: 'off' | 'requesting' | 'on' | 'lost' | 'denied' | 'unavailable' | 'busy' | 'unsupported' | 'error'
 *
 * Returns: { stream, status, start, stop }
 */
export default function useCamera() {
  const [stream, setStream] = useState(null)
  const [status, setStatus] = useState('off')
  const streamRef = useRef(null)
  const mountedRef = useRef(true)

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setStream(null)
    setStatus((current) => (current === 'on' || current === 'requesting' ? 'off' : current))
  }, [])

  const start = useCallback(async () => {
    if (streamRef.current) return true
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported') // old browser, or a page that isn't https / localhost
      return false
    }

    setStatus('requesting')
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 360 } },
        audio: false, // the microphone is handled separately by the speech hooks
      })

      if (!mountedRef.current) {
        media.getTracks().forEach((track) => track.stop())
        return false
      }

      streamRef.current = media
      // Unplugged, or turned off from the browser's own camera indicator
      media.getVideoTracks()[0]?.addEventListener('ended', () => {
        if (streamRef.current !== media) return
        media.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setStream(null)
        setStatus('lost') // not the same as the user turning it off: the page can warn about it
      })
      setStream(media)
      setStatus('on')
      return true
    } catch (err) {
      if (!mountedRef.current) return false
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') setStatus('denied')
      else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') setStatus('unavailable')
      else if (err.name === 'NotReadableError' || err.name === 'AbortError') setStatus('busy')
      else setStatus('error')
      return false
    }
  }, [])

  // Release the camera whenever the page using it goes away
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  return { stream, status, start, stop }
}
