import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, User, Volume2, VolumeX, CheckCircle, RotateCcw, ShieldAlert, AlertTriangle, Ban, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import ProgressBar from '../components/ui/ProgressBar.jsx'
import Badge from '../components/ui/Badge.jsx'
import TimerDisplay from '../components/interview/TimerDisplay.jsx'
import AIEvaluationLoader from '../components/interview/AIEvaluationLoader.jsx'
import VoiceWaveform from '../components/interview/VoiceWaveform.jsx'
import VoiceControls from '../components/interview/VoiceControls.jsx'
import CameraCheck from '../components/interview/CameraCheck.jsx'
import CameraPip from '../components/interview/CameraPip.jsx'
import { useInterview, ACTIONS } from '../context/InterviewContext.jsx'
import { submitAnswer, finishInterview, exitInterview } from '../api/interviewApi.js'
import useGroqTranscription from '../hooks/useGroqTranscription.js'
import useGroqSpeech from '../hooks/useGroqSpeech.js'
import useAntiCheat from '../hooks/useAntiCheat.js'
import useCamera from '../hooks/useCamera.js'
import { CAMERA_MESSAGES } from '../utils/cameraText.js'

const difficultyColors = { Easy: 'emerald', Medium: 'amber', Hard: 'red' }

// Voice phase machine states
const VOICE_PHASE = {
  AI_SPEAKING:   'ai_speaking',
  USER_IDLE:     'user_idle',
  USER_LISTENING:'user_listening',
  EVALUATING:    'evaluating',
  FEEDBACK:      'feedback',
}

// BUG FIX 1 — Timer: 3 min per question for all difficulties
// (matches the "~n×3 mins" shown on the SetupPage)
const SECONDS_PER_QUESTION = 180

export default function InterviewPage() {
  const navigate = useNavigate()
  const { state, dispatch } = useInterview()
  const {
    sessionId,
    candidate,
    currentQuestion,
    totalQuestions,
    welcomeMessage,
  } = state

  // ── Voice hooks (Groq Whisper in, Groq Orpheus out with browser-voice fallback) ──
  const {
    supported: sttSupported,
    isTranscribing,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useGroqTranscription()

  const { isSpeaking, speak, stop: stopSpeaking, unlock: unlockAudio } = useGroqSpeech()

  // ── Camera (optional self-view; stays in the browser) ──────────────────────
  const camera = useCamera()

  // ── Component state ─────────────────────────────────────────────────────────
  const [voicePhase, setVoicePhase]     = useState(VOICE_PHASE.AI_SPEAKING)
  const [lastEvaluation, setLastEvaluation] = useState(null)
  const [fallbackText, setFallbackText] = useState('')
  const [ttsEnabled, setTtsEnabled]     = useState(true)
  // Autoplay fix: browser blocks audio without a user gesture on the current page.
  const [sessionReady, setSessionReady] = useState(false)
  // Exit flow: confirmation dialog, then "leaving" while the session is discarded
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const hasSpokenWelcomeRef = useRef(false)
  const spokenQuestionRef   = useRef(null)
  const nextDispatchedRef   = useRef(false)
  // Read at call time: chained speech callbacks outlive the render that created them
  const ttsEnabledRef       = useRef(true)
  // onEnd of the speech in flight, so muting mid-sentence still moves the interview on
  const pendingOnEndRef     = useRef(null)
  // Set once the candidate chooses to leave, so late async callbacks do nothing
  const exitingRef          = useRef(false)

  // ── Anti-cheat ───────────────────────────────────────────────────────────────
  const handleDisqualify = useCallback(async () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.warn(err))
    }
    stopSpeaking()
    toast.error('❌ Disqualified: too many violations detected.', { duration: 5000 })
    try {
      const response = await finishInterview(sessionId)
      dispatch({ type: ACTIONS.SET_REPORT, payload: response.data.report })
      navigate('/result')
    } catch {
      navigate('/setup')
    }
  }, [sessionId, dispatch, navigate, stopSpeaking])

  const { violations, showWarning, warningReason, dismissWarning, maxViolations, remaining } =
    useAntiCheat({
      // Only active during the interview. Off while leaving on purpose, and while the browser's
      // camera permission prompt is open (it can steal focus or close full screen).
      enabled: sessionReady && !isExiting && camera.status !== 'requesting',
      maxViolations: 3,
      onDisqualify: handleDisqualify,
    })

  // ── Guard: redirect if no session ───────────────────────────────────────────
  useEffect(() => {
    if (!sessionId && !exitingRef.current) {
      toast.error('No active session. Please start a new interview.')
      navigate('/setup')
    }
  }, [sessionId, navigate])

  // ── Camera alerts ──────────────────────────────────────────────────────────
  const lastCameraStatusRef = useRef('off')
  const wasDarkRef = useRef(false)
  const isDarkRef = useRef(false)
  const cameraTipShownRef = useRef(false)

  useEffect(() => {
    const previous = lastCameraStatusRef.current
    lastCameraStatusRef.current = camera.status
    if (previous === camera.status || exitingRef.current) return

    if (camera.status === 'on') {
      toast.success('Camera is on', { id: 'camera-status' })
    } else if (camera.status === 'off' && previous === 'on') {
      toast('Camera turned off', { id: 'camera-status' })
    } else if (CAMERA_MESSAGES[camera.status] && camera.status !== 'requesting') {
      toast.error(CAMERA_MESSAGES[camera.status], { id: 'camera-status', duration: 6000 })
    }
  }, [camera.status])

  // One-time tip as the interview begins with the camera on
  useEffect(() => {
    if (sessionReady && camera.status === 'on' && !cameraTipShownRef.current) {
      cameraTipShownRef.current = true
      toast('Tip: look at the camera and keep your face in the frame while you answer.', {
        id: 'camera-tip',
        icon: '💡',
        duration: 5000,
      })
    }
  }, [sessionReady, camera.status])

  // Alert when the candidate turns their head left or right for too long, or leaves the picture
  const handleAttention = useCallback((event) => {
    if (isDarkRef.current) return // a dark picture can't be judged; the lighting warning covers it
    if (event === 'away') {
      toast.error('You’ve been looking away for a while. Please face the screen.', {
        id: 'camera-attention',
        icon: '👀',
        duration: 5000,
      })
    } else if (event === 'noface') {
      toast.error('We can’t see your face. Please stay in the frame.', {
        id: 'camera-attention',
        icon: '👀',
        duration: 5000,
      })
    } else if (event === 'recovered') {
      toast.success('Thanks, you’re back in view.', { id: 'camera-attention' })
    }
  }, [])

  // Lighting warning from the camera preview (dark room, covered lens, backlight)
  const handleLightChange = useCallback((level) => {
    isDarkRef.current = level === 'dark'
    if (level === 'dark') {
      wasDarkRef.current = true
      toast.error('Your camera looks dark or covered. Face a light so you’re clearly visible.', {
        id: 'camera-light',
        icon: '💡',
        duration: 6000,
      })
    } else if (wasDarkRef.current) {
      wasDarkRef.current = false
      toast.success('Lighting looks good now.', { id: 'camera-light' })
    }
  }, [])

  // ── Exit: leave the interview without finishing ────────────────────────────
  // Runs in an effect so the anti-cheat listeners are already off (isExiting) before
  // fullscreen is closed; otherwise leaving would count as a violation.
  useEffect(() => {
    if (!isExiting) return
    let cancelled = false

    async function leave() {
      stopSpeaking()
      stopListening()
      camera.stop()
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch((err) => console.warn(err))
      }
      try {
        await exitInterview(sessionId)
      } catch {
        // The unfinished session is harmless if it can't be discarded; still let them leave
        console.warn('Could not discard the unfinished interview on the server.')
      }
      if (cancelled) return
      toast('You left the interview. Nothing was saved.')
      navigate('/dashboard', { replace: true })
      dispatch({ type: ACTIONS.RESET })
    }

    leave()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExiting])

  const handleCameraStart = async () => {
    await camera.start()
    // A permission prompt can drop full screen; go back in (best effort, may need a fresh click)
    if (sessionReady && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => console.warn(err))
    }
  }

  const handleExitConfirmed = () => {
    exitingRef.current = true
    setShowExitConfirm(false)
    setIsExiting(true)
  }

  // Esc closes the confirmation dialog
  useEffect(() => {
    if (!showExitConfirm) return
    const onKey = (e) => e.key === 'Escape' && setShowExitConfirm(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showExitConfirm])

  // ── Utility: speak text (respects TTS mute toggle) ──────────────────────────
  const speakText = useCallback(
    (text, onEnd) => {
      if (!ttsEnabledRef.current) {
        onEnd?.()
        return
      }
      const done = () => {
        if (pendingOnEndRef.current === done) pendingOnEndRef.current = null
        onEnd?.()
      }
      pendingOnEndRef.current = done
      speak(text, { onEnd: done, rate: 0.95, pitch: 1.05 })
    },
    [speak]
  )

  // ── Speak welcome + first question — fires ONLY after user clicks "Begin" ────
  // This satisfies the browser autoplay policy: audio needs a real user gesture.
  useEffect(() => {
    if (!sessionReady || !sessionId || !currentQuestion) return
    if (hasSpokenWelcomeRef.current) return
    hasSpokenWelcomeRef.current = true

    setVoicePhase(VOICE_PHASE.AI_SPEAKING)

    const welcomeText =
      welcomeMessage || `Welcome, ${candidate.name}! Let's begin your ${candidate.role} interview.`
    const questionText = `Here is your first question. ${currentQuestion.text}`

    spokenQuestionRef.current = currentQuestion.id

    speakText(welcomeText, () => {
      setTimeout(() => {
        speakText(questionText, () => {
          setVoicePhase(VOICE_PHASE.USER_IDLE)
        })
      }, 400)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionReady])

  // ── Speak each subsequent question when currentQuestion changes ─────────────
  useEffect(() => {
    if (!currentQuestion) return
    if (!hasSpokenWelcomeRef.current) return  // don't run on first mount (handled above)
    if (spokenQuestionRef.current === currentQuestion.id) return  // already spoken

    spokenQuestionRef.current = currentQuestion.id
    setVoicePhase(VOICE_PHASE.AI_SPEAKING)
    resetTranscript()
    setFallbackText('')

    // BUG FIX 3 — currentQuestion.id equals the 1-based question number accurately
    speakText(
      `Question ${currentQuestion.id} of ${totalQuestions}. ${currentQuestion.text}`,
      () => setVoicePhase(VOICE_PHASE.USER_IDLE)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion])

  // ── Mic controls ─────────────────────────────────────────────────────────────
  const handleStartListening = async () => {
    if (voicePhase === VOICE_PHASE.AI_SPEAKING) stopSpeaking()
    resetTranscript()
    setVoicePhase(VOICE_PHASE.USER_LISTENING)
    const started = await startListening()
    if (!started) setVoicePhase(VOICE_PHASE.USER_IDLE)
  }

  const handleStopListening = () => {
    stopListening()
    setVoicePhase(VOICE_PHASE.USER_IDLE)
  }

  // ── Finish: generate the report and show it ──────────────────────────────────
  const handleFinish = useCallback(async () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.warn(err))
    }
    try {
      const response = await finishInterview(sessionId)
      dispatch({ type: ACTIONS.SET_REPORT, payload: response.data.report })
      navigate('/result')
    } catch {
      toast.error('Failed to generate report. Please try again.')
    }
  }, [sessionId, dispatch, navigate])

  // ── Submit answer ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (sttSupported && isTranscribing) return
    const answerText = sttSupported ? transcript.trim() : fallbackText.trim()

    if (answerText.length < 5) {
      toast.error('Please speak a longer answer before submitting.')
      return
    }

    stopListening()
    setVoicePhase(VOICE_PHASE.EVALUATING)
    // Reset guard for this new round of Q→A
    nextDispatchedRef.current = false

    try {
      const response = await submitAnswer({
        sessionId,
        questionId: currentQuestion.id,
        question:   currentQuestion.text,
        answer:     answerText,
      })

      if (exitingRef.current) return // the candidate left while this answer was being evaluated

      const { evaluation, nextQuestion, isLastQuestion } = response.data

      dispatch({
        type: ACTIONS.ADD_RESULT,
        payload: { ...evaluation, questionId: currentQuestion.id },
      })
      setLastEvaluation(evaluation)
      setVoicePhase(VOICE_PHASE.FEEDBACK)

      if (isLastQuestion) {
        // ── Last question: speak short closing then navigate ──────────────────
        const closingText = `Great effort, ${candidate.name}! You scored ${evaluation.score} out of 100. Generating your full report now.`
        speakText(closingText, () => {
          if (!exitingRef.current) handleFinish()
        })
      } else {
        // ── Non-last: speak feedback, then trigger next question ──────────────
        // Keep feedback text short to avoid TTS cutoff even with chunked fix
        const feedbackText = `You scored ${evaluation.score} out of 100. ${evaluation.feedback}`

        // BUG FIX 2 — guarded dispatch: only dispatch SET_QUESTION once per evaluation.
        // Previously there were TWO dispatchers (TTS onEnd + setTimeout fallback)
        // which caused the question counter to jump by 2.
        const dispatchNext = () => {
          if (nextDispatchedRef.current || exitingRef.current) return
          nextDispatchedRef.current = true
          dispatch({ type: ACTIONS.SET_QUESTION, payload: nextQuestion })
          setLastEvaluation(null)
        }

        speakText(feedbackText, () => {
          // 500ms pause after feedback before speaking next question
          setTimeout(dispatchNext, 500)
        })
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit answer. Please try again.')
      setVoicePhase(VOICE_PHASE.USER_IDLE)
    }
  }, [
    sttSupported,
    isTranscribing,
    transcript,
    fallbackText,
    sessionId,
    currentQuestion,
    candidate.name,
    dispatch,
    stopListening,
    speakText,
    handleFinish,
  ])

  const handleTimeExpired = () => {
    if (exitingRef.current) return
    toast('⏰ Time is up! Generating your report.', { duration: 3000 })
    handleFinish()
  }

  const handleReplayQuestion = () => {
    if (!currentQuestion) return
    stopSpeaking()
    setVoicePhase(VOICE_PHASE.AI_SPEAKING)
    speakText(currentQuestion.text, () => setVoicePhase(VOICE_PHASE.USER_IDLE))
  }

  // ── Derived values ────────────────────────────────────────────────────────────
  // BUG FIX 1 — 3 min per question matches SetupPage's "~n×3 mins" estimate
  const totalSeconds = totalQuestions * SECONDS_PER_QUESTION

  const voiceControlPhase =
    voicePhase === VOICE_PHASE.USER_LISTENING ? 'listening'
    : voicePhase === VOICE_PHASE.EVALUATING   ? 'processing'
    : isTranscribing                          ? 'transcribing'
    : 'idle'

  const controlsDisabled =
    voicePhase === VOICE_PHASE.AI_SPEAKING || voicePhase === VOICE_PHASE.EVALUATING

  if (!sessionId || !currentQuestion) return null

  // ── Click-to-start overlay + Anti-cheat rules notice ─────────────────────────
  if (!sessionReady) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center flex flex-col items-center gap-6 max-w-lg w-full"
        >
          {/* Minimal icon mark */}
          <div className="w-14 h-14 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-300">
            <Brain className="w-7 h-7 stroke-[1.5]" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-400 text-xs font-mono mb-2">
              <span>Ready to begin</span>
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">
              Ready, {candidate.name}?
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Your <span className="text-zinc-200 font-medium">{candidate.role}</span> interview session is prepared. Ensure your microphone is enabled and audio output is audible.
            </p>
          </div>

          {/* Workflow steps */}
          <div className="flex flex-col gap-2 text-xs text-zinc-400 w-full font-mono">
            {[['01','AI asks the technical question aloud'],['02','Click microphone and respond with your answer'],['03','AI evaluates depth, clarity, and precision']].map(([n, label]) => (
              <div key={n} className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#121214] border border-[#27272a]">
                <span className="text-zinc-500 font-semibold">{n}</span>
                <span className="text-left font-sans text-zinc-300">{label}</span>
              </div>
            ))}
          </div>

          {/* Anti-cheat guidelines */}
          <div className="w-full rounded-lg border border-[#27272a] bg-[#121214] p-4 text-left flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span className="text-zinc-300 font-mono text-xs uppercase tracking-wider">Integrity Guidelines</span>
            </div>
            <ul className="flex flex-col gap-1.5 text-xs text-zinc-400">
              <li className="flex items-start gap-2">
                <Ban className="w-3.5 h-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
                <span>Switching tabs or minimizing the browser triggers an integrity notice</span>
              </li>
              <li className="flex items-start gap-2">
                <Ban className="w-3.5 h-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
                <span>Clipboard copy/paste is restricted during active questioning</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                <span>Exceeding 3 infractions automatically concludes the session with current scoring</span>
              </li>
            </ul>
          </div>

          {/* Optional camera check (done here so the permission prompt doesn't interrupt the interview) */}
          <CameraCheck
            stream={camera.stream}
            status={camera.status}
            onStart={camera.start}
            onStop={camera.stop}
            onLightChange={handleLightChange}
          />

          <button
            id="begin-interview-btn"
            onClick={() => {
              unlockAudio() // inside the click, so later Groq audio may autoplay
              setSessionReady(true)
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch((err) => {
                  console.warn('Fullscreen request failed:', err)
                })
              }
            }}
            className="w-full py-3 px-6 rounded-md bg-white hover:bg-zinc-200 text-black font-medium text-sm transition-colors"
          >
            Start Interview
          </button>

          <p className="text-xs font-mono text-zinc-500">
            {totalQuestions} questions &bull; ~{Math.round(totalQuestions * SECONDS_PER_QUESTION / 60)} min allocated
          </p>
        </motion.div>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen pt-20 pb-8 px-4 sm:px-6 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Small floating camera, bottom-left corner (doesn't take layout space) */}
      <CameraPip
        stream={camera.stream}
        status={camera.status}
        onStart={handleCameraStart}
        onStop={camera.stop}
        onLightChange={handleLightChange}
        onAttention={handleAttention}
      />

      {/* Exit confirmation */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            key="exit-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="exit-title"
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121214] border border-[#27272a] rounded-lg p-6 max-w-md w-full text-center flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-300">
                <LogOut className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div>
                <p id="exit-title" className="text-base font-semibold text-white mb-1">Exit the interview?</p>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {state.questionResults.length > 0
                    ? `You've answered ${state.questionResults.length} of ${totalQuestions} questions. You can get a report for those, or leave without saving.`
                    : "You haven't answered any questions yet. If you leave now, nothing will be saved."}
                </p>
              </div>
              <div className="w-full flex flex-col gap-2">
                <button
                  id="exit-keep-btn"
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full py-2.5 rounded-md bg-white hover:bg-zinc-200 text-black font-medium text-xs transition-colors"
                >
                  Keep interviewing
                </button>
                {state.questionResults.length > 0 && (
                  <button
                    id="exit-finish-btn"
                    onClick={() => {
                      setShowExitConfirm(false)
                      handleFinish()
                    }}
                    className="w-full py-2.5 rounded-md bg-[#18181b] border border-[#27272a] hover:border-zinc-500 text-zinc-200 font-medium text-xs transition-colors"
                  >
                    End now &amp; see my report
                  </button>
                )}
                <button
                  id="exit-confirm-btn"
                  onClick={handleExitConfirmed}
                  className="w-full py-2.5 rounded-md border border-red-900/50 bg-red-950/20 hover:bg-red-950/40 text-red-300 font-medium text-xs transition-colors"
                >
                  Exit without saving
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Violation Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            key="violation-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121214] border border-red-900/50 rounded-lg p-6 max-w-md w-full text-center flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-red-950/40 border border-red-900/50 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-semibold text-white mb-1">Violation Detected</p>
                <p className="text-zinc-400 text-xs">
                  {warningReason === 'tab_switch' && 'You switched tabs or minimized the window.'}
                  {warningReason === 'window_blur' && 'The interview window lost focus.'}
                  {warningReason === 'back_button' && 'You attempted to navigate away.'}
                  {warningReason === 'fullscreen_exit' && 'You exited full screen mode.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: maxViolations }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                      i < violations ? 'bg-red-500' : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs">
                <span className="text-red-400 font-mono font-bold">{violations}</span>
                <span className="text-zinc-500 font-mono"> / {maxViolations} violations</span>
                {remaining > 0 && (
                  <span className="text-zinc-500 font-mono"> ({remaining} remaining)</span>
                )}
              </p>
              <button
                onClick={dismissWarning}
                className="w-full py-2.5 rounded-md bg-white hover:bg-zinc-200 text-black font-medium text-xs transition-colors"
              >
                Resume Interview
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto flex flex-col gap-5">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge color={difficultyColors[candidate.difficulty] || 'slate'}>
              {candidate.difficulty}
            </Badge>
            <Badge color="slate">{candidate.role}</Badge>
            <Badge color="slate">{candidate.experience}</Badge>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Exit interview */}
            <button
              id="exit-interview-btn"
              onClick={() => setShowExitConfirm(true)}
              disabled={isExiting}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-colors border-red-900/50 bg-red-950/20 text-red-300 hover:bg-red-950/40 disabled:opacity-50"
              title="Leave the interview"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
            {/* TTS mute/unmute toggle */}
            <button
              onClick={() => {
                const muting = ttsEnabledRef.current
                ttsEnabledRef.current = !muting
                setTtsEnabled(!muting)
                if (muting) {
                  stopSpeaking()
                  // Finish the interrupted speech so the interview doesn't stall waiting on it
                  const pending = pendingOnEndRef.current
                  pendingOnEndRef.current = null
                  pending?.()
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-colors border-[#27272a] bg-[#121214] text-zinc-400 hover:text-zinc-200"
              title={ttsEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
            >
              {ttsEnabled
                ? <Volume2 className="w-3.5 h-3.5 text-zinc-300" />
                : <VolumeX className="w-3.5 h-3.5 text-zinc-600" />}
              <span>{ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
            </button>
            <TimerDisplay initialSeconds={totalSeconds} onExpire={handleTimeExpired} />
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar current={currentQuestion.id - 1} total={totalQuestions} />

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
          {/* Left: AI & Session Info */}
          <div className="flex flex-col gap-3">
            <div className="rounded-lg bg-[#121214] border border-[#27272a] p-4 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-300">
                <Brain className="w-6 h-6 stroke-[1.5]" />
              </div>

              {/* Waveform */}
              <VoiceWaveform isActive={isSpeaking} color="neutral" barCount={10} />

              <div className="text-center">
                <p className="text-xs font-medium text-white">AI Interviewer</p>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  {voicePhase === VOICE_PHASE.AI_SPEAKING
                    ? 'Speaking…'
                    : voicePhase === VOICE_PHASE.EVALUATING
                    ? 'Evaluating…'
                    : voicePhase === VOICE_PHASE.FEEDBACK
                    ? 'Delivering feedback'
                    : 'Awaiting answer'}
                </p>
              </div>

              <div className="w-full h-px bg-[#27272a]" />

              {/* Stats */}
              <div className="w-full flex flex-col gap-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Candidate</span>
                  <span className="text-zinc-200 font-medium">{candidate.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Question</span>
                  <span className="text-white font-mono font-medium">
                    {currentQuestion.id} / {totalQuestions}
                  </span>
                </div>
              </div>
            </div>

            {/* Candidate card */}
            <div className="rounded-lg bg-[#121214] border border-[#27272a] p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-[#18181b] border border-[#27272a] flex items-center justify-center flex-shrink-0 text-zinc-400">
                <User className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-white truncate">{candidate.name}</p>
                <p className="text-[11px] text-zinc-500 font-mono truncate">{candidate.role}</p>
              </div>
            </div>

            {/* Replay button */}
            {(voicePhase === VOICE_PHASE.USER_IDLE || voicePhase === VOICE_PHASE.USER_LISTENING) && (
              <button
                onClick={handleReplayQuestion}
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-md border border-[#27272a] bg-[#121214] text-zinc-400 hover:text-white text-xs font-mono transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Replay Audio
              </button>
            )}
          </div>

          {/* Right: Question + Voice Area */}
          <div className="rounded-lg bg-[#121214] border border-[#27272a] p-6 flex flex-col gap-5 min-h-[460px]">
            <AnimatePresence mode="wait">
              {/* Evaluating loader */}
              {voicePhase === VOICE_PHASE.EVALUATING ? (
                <motion.div
                  key="evaluating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex items-center justify-center"
                >
                  <AIEvaluationLoader />
                </motion.div>
              ) : voicePhase === VOICE_PHASE.FEEDBACK && lastEvaluation ? (
                /* Feedback screen */
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center gap-5 text-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">Response Evaluation</div>
                    <p className="text-2xl font-semibold text-white mb-2">
                      Score: {lastEvaluation.score}<span className="text-zinc-500 text-sm font-normal"> / 100</span>
                    </p>
                    <p className="text-xs text-zinc-400 max-w-md leading-relaxed">{lastEvaluation.feedback}</p>
                  </div>
                  <div className="flex gap-6 text-xs bg-[#18181b] px-5 py-2.5 rounded-md border border-[#27272a]">
                    <div className="text-center">
                      <p className="text-white font-mono font-medium text-base">{lastEvaluation.technicalAccuracy}</p>
                      <p className="text-zinc-500 font-mono text-[10px] uppercase">Technical</p>
                    </div>
                    <div className="w-px bg-[#27272a]" />
                    <div className="text-center">
                      <p className="text-white font-mono font-medium text-base">{lastEvaluation.communication}</p>
                      <p className="text-zinc-500 font-mono text-[10px] uppercase">Clarity</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                    <VoiceWaveform isActive color="neutral" barCount={8} />
                    <span>
                      {isSpeaking ? 'Delivering evaluation audio…' : 'Loading next question…'}
                    </span>
                  </div>
                </motion.div>
              ) : (
                /* Main question + voice controls */
                <motion.div
                  key={`question-${currentQuestion.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-5 flex-1"
                >
                  {/* Prompt card */}
                  <div className="rounded-md bg-[#18181b] border border-[#27272a] p-5">
                    <div className="flex items-center justify-between gap-4 mb-3 pb-2.5 border-b border-[#27272a]">
                      <span className="text-xs font-mono text-zinc-400">
                        Question {currentQuestion.id} of {totalQuestions}
                      </span>
                      {voicePhase === VOICE_PHASE.AI_SPEAKING && (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Speaking
                        </div>
                      )}
                    </div>

                    <p className="text-white text-base font-medium leading-relaxed">
                      {currentQuestion.text}
                    </p>

                    {voicePhase === VOICE_PHASE.AI_SPEAKING && (
                      <div className="mt-3">
                        <VoiceWaveform isActive={isSpeaking} color="neutral" barCount={16} />
                      </div>
                    )}
                  </div>

                  {/* Voice controls */}
                  <VoiceControls
                    phase={voiceControlPhase}
                    transcript={transcript}
                    onStartListening={handleStartListening}
                    onStopListening={handleStopListening}
                    onSubmit={handleSubmit}
                    disabled={controlsDisabled}
                    supported={sttSupported}
                    fallbackValue={fallbackText}
                    onFallbackChange={setFallbackText}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  )
}
