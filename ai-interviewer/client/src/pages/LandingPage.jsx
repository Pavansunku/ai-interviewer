import { useNavigate } from 'react-router-dom'
import { Brain, Zap, Shield, TrendingUp, ChevronRight, Check, Settings, Mic, BarChart3, ArrowDown } from 'lucide-react'
import Button from '../components/ui/Button.jsx'

const steps = [
  {
    icon: Settings,
    number: '01',
    title: 'Configure Your Session',
    desc: 'Select your target role, seniority level, difficulty, and question count.',
  },
  {
    icon: Mic,
    number: '02',
    title: 'Voice or Text Interview',
    desc: 'Respond to progressive technical questions with real-time speech transcription.',
  },
  {
    icon: BarChart3,
    number: '03',
    title: 'Comprehensive Feedback',
    desc: 'Receive instant evaluation across technical accuracy, clarity, and communication.',
  },
]

const features = [
  { icon: Brain, label: 'Adaptive Questions' },
  { icon: Zap, label: 'Real-time Voice Analysis' },
  { icon: Shield, label: 'Objective Scoring' },
  { icon: TrendingUp, label: 'Historical Analytics' },
]

const roles = ['Frontend', 'Backend', 'Full Stack', 'AI / ML', 'Data Engineering', 'DevOps / Cloud']

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-28">
        {/* Hero */}
        <section className="flex flex-col items-center text-center gap-6 mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121214] border border-[#27272a] text-xs font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>AI Technical Interview Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white max-w-3xl leading-[1.12]">
            Practice technical interviews with intelligent, real-time feedback
          </h1>

          <p className="max-w-xl text-zinc-400 text-base sm:text-lg leading-relaxed">
            Simulate real engineering interviews with AI. Speak your answers naturally, evaluate technical depth, and identify blind spots before real interview day.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => navigate('/setup')}
              id="hero-start-btn"
            >
              Start Interview
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              How it works
              <ArrowDown className="w-4 h-4 ml-1 opacity-70" />
            </Button>
          </div>

          {/* Feature indicators */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#121214] border border-[#27272a] text-zinc-400 text-xs"
              >
                <Icon className="w-3.5 h-3.5 opacity-70" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Roles section */}
        <section className="mb-24 flex flex-col items-center gap-3">
          <p className="text-zinc-500 text-xs font-mono tracking-wider uppercase">Supported Roles</p>
          <div className="flex flex-wrap justify-center gap-2">
            {roles.map((role) => (
              <span
                key={role}
                className="px-3 py-1.5 rounded-md bg-[#121214] border border-[#27272a] text-zinc-300 text-xs font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mb-24">
          <div className="text-center mb-12">
            <p className="text-zinc-500 text-xs font-mono tracking-wider uppercase mb-2">Workflow</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Simple, focused preparation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-lg bg-[#121214] border border-[#27272a] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-8 h-8 rounded-md bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-300">
                      <step.icon className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <span className="font-mono text-xs text-zinc-500 font-semibold">{step.number}</span>
                  </div>
                  <h3 className="text-base font-medium text-white mb-2">{step.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Evaluation Output Details */}
        <section className="rounded-lg bg-[#121214] border border-[#27272a] p-8 sm:p-10">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
              Comprehensive report on every session
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Every practice session produces actionable analysis so you know exactly where to improve.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {[
              'Overall competency score',
              'Technical depth & accuracy breakdown',
              'Communication clarity & pacing analysis',
              'Key strengths highlighted',
              'Actionable improvement suggestions',
              'Curated study references',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs">
                <Check className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button size="lg" onClick={() => navigate('/setup')} id="bottom-start-btn">
              Begin Interview Now
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
