import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Zap, MessageSquare, TrendingUp, AlertTriangle, BookOpen, RotateCcw, Check } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useInterview, ACTIONS } from '../context/InterviewContext.jsx'

// Minimal Flat Score Ring
function ScoreRing({ score, label, color = '#ffffff', size = 110 }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDash = (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#27272a" strokeWidth="6" />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - strokeDash }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-medium text-2xl text-white">{score}</span>
        </div>
      </div>
      <p className="text-xs font-mono text-zinc-400 text-center tracking-wider uppercase">{label}</p>
    </div>
  )
}

function Chip({ children, type = 'strength' }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border bg-[#18181b] border-[#27272a] text-zinc-300">
      {type === 'strength' ? (
        <Check className="w-3.5 h-3.5 text-zinc-400" />
      ) : (
        <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />
      )}
      {children}
    </span>
  )
}

export default function ResultPage() {
  const navigate = useNavigate()
  const { state, dispatch } = useInterview()
  const { report } = state

  useEffect(() => {
    if (!report) {
      navigate('/')
    }
  }, [report, navigate])

  if (!report) return null

  const {
    overallScore = 0,
    technicalAccuracy = 0,
    communicationScore = 0,
    strengths = [],
    weaknesses = [],
    feedback = '',
    suggestedTopics = [],
    role,
    difficulty,
    questionsAnswered,
    totalQuestions,
  } = report

  const handleNewInterview = () => {
    dispatch({ type: ACTIONS.RESET })
    navigate('/setup')
  }

  return (
    <main className="min-h-screen pt-20 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121214] border border-[#27272a] text-zinc-400 text-xs font-mono mb-3">
            <Trophy className="w-3.5 h-3.5 text-zinc-400" />
            <span>Interview Complete</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-2">
            Performance Summary
          </h1>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge color="slate">{role}</Badge>
            <Badge color="slate">{difficulty}</Badge>
            <Badge color="slate">{questionsAnswered} / {totalQuestions} Questions</Badge>
          </div>
        </div>

        {/* Score Cards */}
        <div className="rounded-lg bg-[#121214] border border-[#27272a] p-8">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
            <ScoreRing score={overallScore} label="Overall Score" color="#ffffff" size={120} />
            <ScoreRing score={technicalAccuracy} label="Technical Depth" color="#a1a1aa" size={110} />
            <ScoreRing score={communicationScore} label="Communication" color="#71717a" size={110} />
          </div>
        </div>

        {/* AI Feedback */}
        <div className="rounded-lg bg-[#121214] border border-[#27272a] p-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-medium text-white">General Assessment</h2>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">{feedback}</p>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Strengths */}
          <div className="rounded-lg bg-[#121214] border border-[#27272a] p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-medium text-white">Demonstrated Strengths</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {strengths.length > 0 ? (
                strengths.map((s) => <Chip key={s} type="strength">{s}</Chip>)
              ) : (
                <p className="text-zinc-500 text-xs font-mono">No specific strengths recorded.</p>
              )}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="rounded-lg bg-[#121214] border border-[#27272a] p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-medium text-white">Areas for Improvement</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {weaknesses.length > 0 ? (
                weaknesses.map((w) => <Chip key={w} type="weakness">{w}</Chip>)
              ) : (
                <p className="text-zinc-500 text-xs font-mono">No specific areas recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Suggested Topics */}
        {suggestedTopics.length > 0 && (
          <div className="rounded-lg bg-[#121214] border border-[#27272a] p-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-medium text-white">Recommended Study Topics</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suggestedTopics.map((topic, i) => (
                <div
                  key={topic}
                  className="flex items-center gap-3 p-3 rounded-md bg-[#18181b] border border-[#27272a] text-xs text-zinc-300"
                >
                  <span className="font-mono text-xs text-zinc-500 font-semibold">{String(i + 1).padStart(2, '0')}</span>
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-Question Breakdown */}
        {report.questionResults && report.questionResults.length > 0 && (
          <div className="rounded-lg bg-[#121214] border border-[#27272a] p-6">
            <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-zinc-400" />
              Question Breakdown
            </h2>
            <div className="flex flex-col gap-2.5">
              {report.questionResults.map((qr, i) => (
                <div key={i} className="rounded-md bg-[#18181b] border border-[#27272a] p-3.5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="text-xs text-zinc-300 flex-1 leading-relaxed">
                      <span className="text-zinc-500 font-mono font-medium mr-2">Q{i + 1}.</span>
                      {qr.question}
                    </p>
                    <span className="text-xs font-mono font-medium text-white flex-shrink-0">
                      {qr.score}/100
                    </span>
                  </div>
                  <div className="h-1 bg-[#27272a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-300 rounded-full"
                      style={{ width: `${qr.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            size="lg"
            onClick={handleNewInterview}
            className="w-full sm:w-auto"
            id="new-interview-btn"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Start Another Interview
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto"
            id="view-dashboard-btn"
          >
            View Dashboard
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto"
            id="go-home-btn"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </main>
  )
}
