import { useEffect, useRef, useState } from 'react'
import { CameraOff, Minimize2 } from 'lucide-react'
import { clampPosition } from '../../utils/clampPosition.js'
import { CAMERA_MESSAGES } from '../../utils/cameraText.js'
import useLightLevel from '../../hooks/useLightLevel.js'
import useHeadPose from '../../hooks/useHeadPose.js'

/**
 * Small floating self-view in the bottom-left corner (like a video call).
 * It sits above the page, so it never adds height or causes scrolling.
 * Drag it anywhere, minimise it to a small button, or turn the camera off.
 * The video stays in the browser; nothing is recorded or uploaded.
 */
export default function CameraPip({ stream, status, onStart, onStop, onLightChange, onAttention }) {
  const boxRef = useRef(null)
  const videoRef = useRef(null)
  const dragRef = useRef(null)
  const [pos, setPos] = useState(null) // null = default corner
  const [minimized, setMinimized] = useState(false)

  const isOn = status === 'on' && Boolean(stream)
  const showVideo = isOn && !minimized
  const light = useLightLevel(videoRef, showVideo)
  const head = useHeadPose(videoRef, showVideo, onAttention)
  const lookingAway = head.level === 'warn' && light !== 'dark'

  useEffect(() => {
    onLightChange?.(light)
  }, [light, onLightChange])

  // The <video> only exists while expanded, so (re)attach the stream when that changes
  useEffect(() => {
    const video = videoRef.current
    if (video) video.srcObject = showVideo ? stream : null
  }, [stream, showVideo])

  // After a window resize, return to the default corner so it can't end up off-screen
  useEffect(() => {
    const reset = () => setPos(null)
    window.addEventListener('resize', reset)
    return () => window.removeEventListener('resize', reset)
  }, [])

  const handlePointerDown = (e) => {
    const box = boxRef.current
    if (!box || e.target.closest('button')) return // let the buttons work normally
    const rect = box.getBoundingClientRect()
    dragRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e) => {
    const drag = dragRef.current
    const box = boxRef.current
    if (!drag || !box) return
    setPos(
      clampPosition({
        x: e.clientX - drag.dx,
        y: e.clientY - drag.dy,
        width: box.offsetWidth,
        height: box.offsetHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      })
    )
  }

  const stopDrag = () => {
    dragRef.current = null
  }

  const placement = pos ? { left: pos.x, top: pos.y } : { left: 16, bottom: 16 }

  // ── Not showing video: one compact button ───────────────────────────────────
  if (!showVideo) {
    const label = isOn
      ? 'Show camera'
      : status === 'requesting'
      ? 'Starting…'
      : status === 'off'
      ? 'Turn on camera'
      : 'Retry camera'
    const message = !isOn && CAMERA_MESSAGES[status]

    return (
      <div ref={boxRef} className="fixed z-40 flex flex-col items-start gap-1.5" style={placement}>
        {message && (
          <p className="max-w-[180px] rounded-md bg-[#121214] border border-[#27272a] px-2 py-1 text-[10px] leading-snug text-zinc-400">
            {message}
          </p>
        )}
        <button
          type="button"
          id="camera-pip-toggle-btn"
          onClick={isOn ? () => setMinimized(false) : onStart}
          disabled={status === 'requesting'}
          title={label}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#121214]/95 border border-[#27272a] hover:border-zinc-500 disabled:opacity-60 text-zinc-300 text-[11px] font-mono shadow-lg transition-colors"
        >
          {isOn ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <CameraOff className="w-3.5 h-3.5" />
          )}
          {label}
        </button>
      </div>
    )
  }

  // ── Live preview ────────────────────────────────────────────────────────────
  return (
    <div
      ref={boxRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      className={`fixed z-40 w-20 sm:w-28 aspect-[4/3] overflow-hidden rounded-lg border bg-[#18181b] shadow-xl ${lookingAway ? 'border-amber-500 ring-2 ring-amber-500/60' : 'border-[#27272a]'} cursor-grab active:cursor-grabbing`}
      style={{ ...placement, touchAction: 'none' }}
      aria-label="Your camera preview"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover pointer-events-none"
        style={{ transform: 'scaleX(-1)' }} // mirror, like a video call
      />

      <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-black/50 px-1 py-0.5 text-[9px] font-mono text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="hidden sm:inline">Live</span>
      </span>

      {(light === 'dark' || lookingAway) && (
        <span className="absolute inset-x-1 bottom-1 rounded bg-amber-500/90 px-1 py-0.5 text-center text-[9px] font-medium text-black">
          {light === 'dark' ? 'Too dark' : head.pose === 'noface' ? 'Face not visible' : 'Face the screen'}
        </span>
      )}

      <div className="absolute right-1 top-1 flex gap-1">
        <button
          type="button"
          id="camera-pip-minimize-btn"
          onClick={() => setMinimized(true)}
          title="Minimise"
          aria-label="Minimise camera preview"
          className="p-1 rounded bg-black/50 hover:bg-black/70 text-zinc-200 transition-colors"
        >
          <Minimize2 className="w-3 h-3" />
        </button>
        <button
          type="button"
          id="camera-pip-off-btn"
          onClick={onStop}
          title="Turn off camera"
          aria-label="Turn off camera"
          className="p-1 rounded bg-black/50 hover:bg-red-600/80 text-zinc-200 transition-colors"
        >
          <CameraOff className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
