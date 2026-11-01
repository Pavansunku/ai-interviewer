import { useEffect, useRef } from 'react'
import { Camera, CameraOff, ShieldCheck, Lightbulb } from 'lucide-react'
import useLightLevel from '../../hooks/useLightLevel.js'
import useHeadPose from '../../hooks/useHeadPose.js'
import { CAMERA_MESSAGES, CAMERA_TIPS } from '../../utils/cameraText.js'

/**
 * Optional camera check on the "Ready to begin" screen: a small mirrored preview,
 * a few setup tips, and a warning if the picture is too dark.
 * The video stays in the browser; nothing is recorded or uploaded.
 */
export default function CameraCheck({ stream, status, onStart, onStop, onLightChange }) {
  const videoRef = useRef(null)
  const isOn = status === 'on' && Boolean(stream)
  const isRequesting = status === 'requesting'
  const light = useLightLevel(videoRef, isOn)
  const head = useHeadPose(videoRef, isOn)

  useEffect(() => {
    const video = videoRef.current
    if (video) video.srcObject = isOn ? stream : null
  }, [stream, isOn])

  useEffect(() => {
    onLightChange?.(light)
  }, [light, onLightChange])

  return (
    <div className="w-full max-w-md rounded-lg bg-[#121214] border border-[#27272a] p-3.5 flex flex-col sm:flex-row gap-3.5">
      {/* Small preview */}
      <div className="flex flex-col items-center gap-2 sm:w-32 flex-shrink-0">
        <div className="relative w-32 aspect-[4/3] overflow-hidden rounded-md bg-[#18181b] border border-[#27272a]">
          {isOn ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                aria-label="Your camera preview"
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-black/50 px-1 py-0.5 text-[9px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
              {light === 'dark' && (
                <span className="absolute inset-x-1 bottom-1 rounded bg-amber-500/90 px-1 py-0.5 text-center text-[9px] font-medium text-black">
                  Too dark
                </span>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 text-center text-zinc-500">
              <CameraOff className="w-5 h-5 stroke-[1.5]" />
              <p className="text-[10px] leading-snug">{CAMERA_MESSAGES[status] || 'Camera is off'}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          id="camera-toggle-ready-btn"
          onClick={isOn ? onStop : onStart}
          disabled={isRequesting}
          className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-md border border-[#27272a] bg-[#18181b] hover:border-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-300 text-[11px] font-mono transition-colors"
        >
          {isOn ? <CameraOff className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
          {isOn ? 'Turn off' : isRequesting ? 'Starting…' : status === 'off' ? 'Turn on' : 'Try again'}
        </button>
      </div>

      {/* Instructions */}
      <div className="flex flex-col gap-2 text-left min-w-0">
        <p className="text-xs font-semibold text-white">Camera check <span className="font-normal text-zinc-500">(optional)</span></p>
        <ul className="flex flex-col gap-1.5">
          {CAMERA_TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-1.5 text-[11px] leading-snug text-zinc-400">
              <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0 text-zinc-500" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        {isOn && (
          <p
            className={`text-[11px] leading-snug ${
              head.status === 'ready' && head.pose === 'center' ? 'text-emerald-400' : 'text-zinc-400'
            }`}
          >
            {head.status === 'loading'
              ? 'Loading head-turn alerts…'
              : head.status === 'unavailable'
              ? 'Head-turn alerts are unavailable (they need an internet connection).'
              : head.pose === 'center'
              ? '✓ Facing the camera. Head-turn alerts are on.'
              : head.pose === 'away'
              ? 'Turn your face towards the camera.'
              : head.pose === 'noface'
              ? 'I can’t see your face. Move into the frame.'
              : 'Checking…'}
          </p>
        )}
        {light === 'dark' && isOn && (
          <p className="text-[11px] leading-snug text-amber-400">
            Your picture is dark or covered. Face a light or uncover the lens.
          </p>
        )}
        <p className="flex items-start gap-1.5 text-[11px] leading-snug text-zinc-500">
          <ShieldCheck className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>Your video stays in your browser. It isn’t recorded or uploaded.</span>
        </p>
      </div>
    </div>
  )
}
