import { useEffect, useRef, useState } from 'react'
import { loadFaceLandmarker } from '../lib/faceLandmarker.js'
import { classifyPose, initialAttention, stepAttention } from '../utils/headPose.js'

const CHECK_EVERY_MS = 200 // about 5 checks a second is plenty for head turns

/**
 * Watches the live video and notices when the person turns their head left or right
 * (or leaves the picture) for too long. Everything happens in the browser.
 *
 * status: 'loading' | 'ready' | 'unavailable' (model couldn't load, e.g. offline)
 * pose:   latest reading: null | 'center' | 'away' | 'noface'
 * level:  'ok' | 'away' | 'warn'   ('warn' = away longer than the allowed time)
 *
 * onEvent('away' | 'noface' | 'recovered') fires when an alert should be shown.
 */
export default function useHeadPose(videoRef, active, onEvent, loader = loadFaceLandmarker) {
  const [status, setStatus] = useState('loading')
  const [pose, setPose] = useState(null)
  const [level, setLevel] = useState('ok')
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!active) return undefined

    let cancelled = false
    let timer = null

    loader()
      .then((landmarker) => {
        if (cancelled) return
        setStatus('ready')
        let state = initialAttention()
        let lastPose = null

        timer = setInterval(() => {
          const video = videoRef.current
          if (!video || video.readyState < 2 || document.hidden) return

          let sample
          try {
            sample = classifyPose(landmarker.detectForVideo(video, performance.now()).faceLandmarks?.[0])
          } catch {
            return // frame not ready; try again next time
          }

          if (sample !== lastPose) {
            lastPose = sample
            setPose(sample)
          }
          const next = stepAttention(state, sample, Date.now())
          if (next.state.level !== state.level) setLevel(next.state.level)
          state = next.state
          if (next.event) onEventRef.current?.(next.event)
        }, CHECK_EVERY_MS)
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable')
      })

    return () => {
      cancelled = true
      clearInterval(timer)
      setStatus('loading')
      setPose(null)
      setLevel('ok')
    }
  }, [active, videoRef, loader])

  return { status, pose, level }
}
