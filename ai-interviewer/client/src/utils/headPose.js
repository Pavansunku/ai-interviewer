// Turns face landmarks into "is the person facing the screen?" and tracks how long they look away.
// Pure functions, so the rules below can be tuned and tested without a camera.

// MediaPipe face-mesh points: nose tip and the two edges of the face (near the ears)
const NOSE = 1
const FACE_EDGE_A = 234
const FACE_EDGE_B = 454

// How far the nose may sit from the middle of the face before it counts as turned.
// 0 = dead centre; about 0.17 is roughly a 25° turn left or right.
export const YAW_LIMIT = 0.17

export const WARN_MS = 5000 // looking away this long triggers an alert
export const REPEAT_MS = 15000 // while still away, remind again after this long
export const RESET_STREAK = 2 // facing the screen for this many checks in a row ends the "away" timer

// Where the nose sits between the two face edges: ~0.5 when facing the camera.
export function yawRatio(landmarks) {
  const nose = landmarks?.[NOSE]
  const a = landmarks?.[FACE_EDGE_A]
  const b = landmarks?.[FACE_EDGE_B]
  if (!nose || !a || !b) return null
  const width = Math.abs(b.x - a.x)
  if (width < 0.02) return null // face too small or too far to judge
  return (nose.x - Math.min(a.x, b.x)) / width
}

// 'center' | 'away' (head turned left or right) | 'noface' (nobody in view)
export function classifyPose(landmarks) {
  if (!landmarks || landmarks.length === 0) return 'noface'
  const ratio = yawRatio(landmarks)
  if (ratio === null) return 'noface'
  return Math.abs(ratio - 0.5) > YAW_LIMIT ? 'away' : 'center'
}

export const initialAttention = () => ({
  awaySince: null,
  centerStreak: 0,
  lastAlertAt: null,
  level: 'ok', // 'ok' | 'away' (just turned, still within the grace time) | 'warn' (too long)
})

// One step of the timer. `sample` is the latest classifyPose() result.
// Returns the new state plus an optional event: 'away' | 'noface' | 'recovered'.
export function stepAttention(state, sample, now) {
  if (sample === 'center') {
    const centerStreak = state.centerStreak + 1
    if (state.awaySince === null || centerStreak < RESET_STREAK) {
      return { state: { ...state, centerStreak }, event: null }
    }
    return { state: initialAttention(), event: state.level === 'warn' ? 'recovered' : null }
  }

  const awaySince = state.awaySince ?? now
  const level = now - awaySince >= WARN_MS ? 'warn' : 'away'
  let lastAlertAt = state.lastAlertAt
  let event = null
  if (level === 'warn' && (lastAlertAt === null || now - lastAlertAt >= REPEAT_MS)) {
    event = sample
    lastAlertAt = now
  }
  return { state: { awaySince, centerStreak: 0, lastAlertAt, level }, event }
}
