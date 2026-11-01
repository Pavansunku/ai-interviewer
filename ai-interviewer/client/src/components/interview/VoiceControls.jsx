import { Mic, MicOff, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import VoiceWaveform from './VoiceWaveform.jsx'

/**
 * VoiceControls
 * The central mic button + transcript display for the voice interview.
 *
 * Props:
 *   phase            – 'idle' | 'listening' | 'transcribing' | 'processing'
 *   transcript       – string, transcript of the recorded answer
 *   onStartListening – fn()
 *   onStopListening  – fn()
 *   onSubmit         – fn()
 *   disabled         – boolean (during AI speaking, evaluating, etc.)
 *   supported        – boolean (microphone recording available)
 *   fallbackValue    – string  (for text fallback input)
 *   onFallbackChange – fn(value) (for text fallback input)
 */
export default function VoiceControls({
  phase = 'idle',
  transcript = '',
  onStartListening,
  onStopListening,
  onSubmit,
  disabled = false,
  supported = true,
  fallbackValue = '',
  onFallbackChange,
}) {
  const isListening = phase === 'listening'
  const isProcessing = phase === 'processing'
  const isTranscribing = phase === 'transcribing'
  const hasTranscript = transcript.trim().length > 0

  if (!supported) {
    // Text fallback for unsupported browsers
    return (
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
          <MicOff className="w-3.5 h-3.5" />
          <span>Voice input unavailable. Type your response below.</span>
        </div>
        <textarea
          className="w-full min-h-[130px] rounded-lg bg-[#121214] border border-[#27272a] text-zinc-200 placeholder:text-zinc-600 text-sm p-3.5 resize-none focus:outline-none focus:border-zinc-500 transition-colors"
          placeholder="Type your answer here…"
          value={fallbackValue}
          onChange={(e) => onFallbackChange?.(e.target.value)}
          disabled={disabled}
        />
        <button
          onClick={onSubmit}
          disabled={disabled || fallbackValue.trim().length < 10}
          className="self-end px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-black font-medium text-xs transition-colors"
        >
          Submit Answer
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Transcript display box */}
      <div className="w-full min-h-[100px] rounded-lg bg-[#121214] border border-[#27272a] p-4 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {isTranscribing ? (
            <motion.div
              key="transcribing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-2 py-3"
            >
              <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
              <p className="text-zinc-400 text-xs font-mono tracking-wider mt-1">
                Transcribing…
              </p>
            </motion.div>
          ) : isListening && !hasTranscript ? (
            <motion.div
              key="listening-placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full gap-2 py-3"
            >
              <VoiceWaveform isActive color="red" barCount={16} />
              <p className="text-zinc-400 text-xs font-mono tracking-wider mt-2">
                Listening…
              </p>
            </motion.div>
          ) : hasTranscript ? (
            <motion.div
              key="transcript"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-zinc-400 font-mono tracking-wider">
                  Your Response
                </span>
                {isListening && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-red-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    Recording
                  </span>
                )}
              </div>
              <p className="text-zinc-200 text-sm leading-relaxed">
                {transcript}
                {isListening && (
                  <span className="ml-1 inline-block w-0.5 h-3.5 bg-zinc-400 align-middle animate-pulse" />
                )}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle-placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full py-4"
            >
              <p className="text-zinc-500 text-sm text-center">
                Click microphone to speak or start answering
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mic button + submit row */}
      <div className="flex items-center gap-4">
        {/* Main mic button */}
        <button
          id="voice-mic-btn"
          onClick={isListening ? onStopListening : onStartListening}
          disabled={disabled || isProcessing || isTranscribing}
          className={[
            'relative w-14 h-14 rounded-full flex items-center justify-center transition-colors',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            isListening
              ? 'bg-red-600 hover:bg-red-500 text-white'
              : 'bg-white hover:bg-zinc-200 text-black',
          ].join(' ')}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Loader2 className="w-5 h-5 text-current animate-spin" />
              </motion.div>
            ) : isListening ? (
              <motion.div
                key="mic-active"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <MicOff className="w-5 h-5 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="mic-idle"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Mic className="w-5 h-5 text-black" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Submit button — visible when there is a transcript */}
        <AnimatePresence>
          {hasTranscript && !isListening && !isTranscribing && (
            <motion.button
              key="submit-btn"
              id="submit-voice-answer-btn"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              onClick={onSubmit}
              disabled={disabled || isProcessing}
              className="px-4 py-2.5 rounded-lg bg-zinc-100 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-zinc-900 font-medium text-xs transition-colors"
            >
              Submit Answer
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Status text */}
      <p className="text-xs text-zinc-500 font-mono text-center">
        {isListening
          ? 'Recording in progress… click mic when finished'
          : isTranscribing
          ? 'Converting your answer to text…'
          : hasTranscript
          ? 'Answer ready. Click mic to re-record or submit.'
          : 'Click mic when you are ready to answer'}
      </p>
    </div>
  )
}
