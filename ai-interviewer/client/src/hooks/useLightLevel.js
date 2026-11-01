import { useEffect, useState } from 'react'
import { averageLuma, stepLight } from '../utils/lightLevel.js'

/**
 * Checks the live video every couple of seconds and reports 'ok' or 'dark'.
 * Works on a tiny 16x12 copy of the frame inside the browser; nothing is stored or sent.
 */
export default function useLightLevel(videoRef, active) {
  const [level, setLevel] = useState('ok')

  useEffect(() => {
    if (!active) return undefined

    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 12
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    let state = { low: 0, high: 0, level: 'ok' }

    const timer = setInterval(() => {
      const video = videoRef.current
      if (!ctx || !video || video.readyState < 2) return
      try {
        ctx.drawImage(video, 0, 0, 16, 12)
        const next = stepLight(state, averageLuma(ctx.getImageData(0, 0, 16, 12).data))
        if (next.level !== state.level) setLevel(next.level)
        state = next
      } catch {
        // Frame not readable yet; try again on the next tick
      }
    }, 1500)

    return () => {
      clearInterval(timer)
      setLevel('ok')
    }
  }, [videoRef, active])

  return level
}
