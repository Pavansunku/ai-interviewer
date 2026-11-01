import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Trophy, Zap, Calendar, ChevronDown, ChevronUp,
  MessageSquare, Mic, User, Target,
  RotateCcw, BarChart2, Clock, TrendingUp, TrendingDown, Lightbulb, Award,
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { getInterviewHistory } from '../api/interviewApi.js'
import { topItems, roleStats, bestInterview } from '../utils/insights.js'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Minimal Flat Mini Ring
function MiniRing({ score, size = 48, strokeWidth = 4 }) {
  const r = (size - strokeWidth * 2) / 2
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff"
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - fill }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute text-xs font-mono font-medium text-white">{score}</span>
    </div>
  )
}

// Flat Question Card
function QuestionCard({ qr, index }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-md border border-[#27272a] bg-[#18181b] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3.5 p-3.5 text-left hover:bg-[#202023] transition-colors"
      >
        <span className="text-xs font-mono text-zinc-500 font-semibold w-5 text-center flex-shrink-0">
          {index + 1}
        </span>

        <p className="flex-1 text-xs text-zinc-300 leading-relaxed line-clamp-1">{qr.question}</p>

        <span className="text-xs font-mono font-medium text-white px-2 py-0.5 rounded bg-[#121214] border border-[#27272a] flex-shrink-0">
          {qr.score}/100
        </span>

        {open ? <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-3.5 border-t border-[#27272a] pt-3.5">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {[['Overall', qr.score], ['Technical', qr.technicalAccuracy], ['Clarity', qr.communication]].map(([label, val]) => (
                  <div key={label} className="p-2 rounded bg-[#121214] border border-[#27272a] flex flex-col gap-1">
                    <span className="text-zinc-500 font-mono text-[10px] uppercase">{label}</span>
                    <span className="font-mono font-medium text-white">{val}</span>
                  </div>
                ))}
              </div>

              {/* Candidate's answer */}
              {qr.answer && (
                <div className="rounded bg-[#121214] border border-[#27272a] p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Mic className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">Your Answer</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{qr.answer}</p>
                </div>
              )}

              {/* Feedback */}
              {qr.feedback && (
                <div className="rounded bg-[#121214] border border-[#27272a] p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">Feedback</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{qr.feedback}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Small coloured tag used for strengths / weak areas / topics
function Chip({ tone = 'neutral', count, children }) {
  const tones = {
    strength: 'bg-green-500/10 text-green-400 border-green-500/20',
    weakness: 'bg-red-500/10 text-red-400 border-red-500/20',
    topic: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    neutral: 'bg-[#18181b] text-zinc-300 border-[#27272a]',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs leading-snug ${tones[tone]}`}>
      {children}
      {count > 1 && <span className="font-mono text-[10px] opacity-70">×{count}</span>}
    </span>
  )
}

function InsightCard({ icon: Icon, title, hint, children }) {
  return (
    <div className="rounded-lg bg-[#121214] border border-[#27272a] p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-zinc-400" />
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300">{title}</h3>
        {hint && <span className="ml-auto text-[11px] font-mono text-zinc-500">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function ChipList({ items, tone, empty }) {
  if (!items.length) return <p className="text-xs text-zinc-500 font-mono">{empty}</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Chip key={item.text} tone={tone} count={item.count}>{item.text}</Chip>
      ))}
    </div>
  )
}

// Cross-interview insights: best session, strongest/weakest topics, what to improve
function InsightsPanel({ history }) {
  const { best, roles, strengths, weaknesses, topics } = useMemo(
    () => ({
      best: bestInterview(history),
      roles: roleStats(history),
      strengths: topItems(history, 'strengths', 6),
      weaknesses: topItems(history, 'weaknesses', 6),
      topics: topItems(history, 'suggestedTopics', 8),
    }),
    [history]
  )

  const strongest = roles.length > 1 ? roles[0] : null
  const weakest = roles.length > 1 && roles[roles.length - 1].avg < roles[0].avg ? roles[roles.length - 1] : null

  return (
    <section className="flex flex-col gap-3" aria-label="Your insights">
      <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Your insights</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Best interview */}
        <InsightCard icon={Award} title="Best interview">
          {best && (
            <div className="flex items-center gap-4">
              <MiniRing score={best.overallScore || 0} size={56} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{best.role}</p>
                <p className="text-xs text-zinc-400 font-mono">
                  {best.difficulty}{best.experience ? ` · ${best.experience}` : ''}
                </p>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{formatDate(best.date)}</p>
              </div>
            </div>
          )}
        </InsightCard>

        {/* Score by topic (role) */}
        <InsightCard icon={BarChart2} title="Score by topic" hint="average / 100">
          <div className="flex flex-col gap-2.5">
            {roles.map((r) => {
              const tag = strongest && r.role === strongest.role ? 'strongest' : weakest && r.role === weakest.role ? 'needs work' : null
              return (
                <div key={r.role} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 truncate">
                      {r.role}
                      {tag && (
                        <span className={`ml-2 text-[10px] font-mono ${tag === 'strongest' ? 'text-green-400' : 'text-red-400'}`}>
                          {tag === 'strongest'
                            ? <TrendingUp className="inline w-3 h-3 mr-0.5" />
                            : <TrendingDown className="inline w-3 h-3 mr-0.5" />}
                          {tag}
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-white">{r.avg}<span className="text-zinc-500"> · {r.count}×</span></span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#27272a] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${tag === 'needs work' ? 'bg-red-400' : tag === 'strongest' ? 'bg-green-400' : 'bg-white'}`}
                      style={{ width: `${Math.min(100, Math.max(0, r.avg))}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </InsightCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InsightCard icon={TrendingUp} title="Where you're strong">
          <ChipList items={strengths} tone="strength" empty="No strengths recorded yet." />
        </InsightCard>
        <InsightCard icon={TrendingDown} title="Where you're weak">
          <ChipList items={weaknesses} tone="weakness" empty="No weak areas recorded yet." />
        </InsightCard>
      </div>

      <InsightCard icon={Lightbulb} title="Topics to improve" hint="study these next">
        <ChipList items={topics} tone="topic" empty="No suggested topics yet." />
      </InsightCard>
    </section>
  )
}

// Flat Interview History Card
function InterviewCard({ entry, isBest }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg bg-[#121214] border border-[#27272a] overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#18181b] transition-colors"
      >
        <MiniRing score={entry.overallScore} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-white text-sm">{entry.role}</span>
            {isBest && (
              <Badge color="emerald" size="sm">
                <Trophy className="w-3 h-3" />Best
              </Badge>
            )}
            <Badge color="slate" size="sm">
              {entry.difficulty}
            </Badge>
            {entry.experience && <Badge color="slate" size="sm">{entry.experience}</Badge>}
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-500" />{formatDate(entry.date)}
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3 text-zinc-500" />{entry.questionsAnswered} / {entry.totalQuestions} questions
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-mono font-medium px-2 py-1 rounded bg-[#18181b] border border-[#27272a] text-zinc-300">
            {entry.overallScore} / 100
          </span>
        </div>

        <div className="flex-shrink-0 text-zinc-500">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#27272a] p-5 flex flex-col gap-5">
              {/* Score breakdown */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ['Overall', entry.overallScore],
                  ['Technical Depth', entry.technicalAccuracy],
                  ['Communication', entry.communicationScore],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-md bg-[#18181b] border border-[#27272a] p-3 flex flex-col gap-1">
                    <span className="text-[11px] font-mono uppercase text-zinc-500">{label}</span>
                    <span className="font-mono font-medium text-lg text-white">{val}</span>
                  </div>
                ))}
              </div>

              {/* Strengths / weak areas / topics for this interview */}
              {(entry.strengths?.length > 0 || entry.weaknesses?.length > 0 || entry.suggestedTopics?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ['Strong in', entry.strengths, 'strength'],
                    ['Weak in', entry.weaknesses, 'weakness'],
                  ].map(([label, list, tone]) => (
                    <div key={label} className="rounded-md bg-[#18181b] border border-[#27272a] p-3 flex flex-col gap-2">
                      <span className="text-[11px] font-mono uppercase text-zinc-400">{label}</span>
                      <ChipList items={(list || []).map((text) => ({ text, count: 1 }))} tone={tone} empty="None recorded." />
                    </div>
                  ))}
                  {entry.suggestedTopics?.length > 0 && (
                    <div className="sm:col-span-2 rounded-md bg-[#18181b] border border-[#27272a] p-3 flex flex-col gap-2">
                      <span className="text-[11px] font-mono uppercase text-zinc-400">Topics to improve</span>
                      <ChipList items={entry.suggestedTopics.map((text) => ({ text, count: 1 }))} tone="topic" empty="" />
                    </div>
                  )}
                </div>
              )}

              {/* Overall Feedback */}
              {entry.feedback && (
                <div className="rounded-md bg-[#18181b] border border-[#27272a] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-mono uppercase text-zinc-400">Session Evaluation</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{entry.feedback}</p>
                </div>
              )}

              {/* Per-question accordion */}
              {entry.questionResults?.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Question Breakdown
                  </h3>
                  {entry.questionResults.map((qr, i) => (
                    <QuestionCard key={i} qr={qr} index={i} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Flat Stat Card
function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-lg bg-[#121214] border border-[#27272a] p-4 flex items-center gap-3.5">
      <div className="w-9 h-9 rounded-md bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-400">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xl font-mono font-semibold text-white">{value}</p>
        <p className="text-xs text-zinc-400">{label}</p>
        {sub && <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getInterviewHistory()
      .then((res) => setHistory(res.data.history || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const totalInterviews = history.length
  const avgScore = totalInterviews
    ? Math.round(history.reduce((s, h) => s + (h.overallScore || 0), 0) / totalInterviews)
    : 0
  const bestScore = totalInterviews
    ? Math.max(...history.map((h) => h.overallScore || 0))
    : 0
  const bestId = totalInterviews > 1 ? bestInterview(history)?._id : null
  const totalQuestions = history.reduce((s, h) => s + (h.questionsAnswered || 0), 0)

  return (
    <main className="min-h-screen pt-20 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#121214] border border-[#27272a] text-zinc-400 text-xs font-mono mb-2">
              <LayoutDashboard className="w-3 h-3 text-zinc-400" />
              <span>Interview History</span>
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Performance History</h1>
            <p className="text-zinc-400 text-xs mt-1">Review past session metrics and question details</p>
          </div>
          <Button id="new-interview-dash-btn" onClick={() => navigate('/setup')} size="md">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            New Interview
          </Button>
        </div>

        {/* Stats Row */}
        {totalInterviews > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={BarChart2} label="Sessions" value={totalInterviews} />
            <StatCard icon={Trophy} label="Avg Score" value={`${avgScore}`} sub="out of 100" />
            <StatCard icon={Zap} label="Best Score" value={`${bestScore}`} sub="highest" />
            <StatCard icon={Clock} label="Questions Answered" value={totalQuestions} sub="total" />
          </div>
        )}

        {/* Insights: best interview, strong / weak topics, what to study */}
        {totalInterviews > 0 && !loading && !error && <InsightsPanel history={history} />}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
            <p className="text-zinc-500 font-mono text-xs">Loading history…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <p className="text-red-400 font-mono text-xs">{error}</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center rounded-lg border border-dashed border-[#27272a] bg-[#121214]">
            <div className="w-12 h-12 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-white text-sm mb-1">No recorded interviews yet</p>
              <p className="text-zinc-400 text-xs">Complete your first practice session to see performance data here.</p>
            </div>
            <Button id="start-first-interview-btn" onClick={() => navigate('/setup')}>
              Start First Interview
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
              {totalInterviews} session{totalInterviews !== 1 ? 's' : ''} recorded
            </p>
            {history.map((entry, i) => (
              <InterviewCard key={entry._id || i} entry={entry} isBest={entry._id === bestId} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
