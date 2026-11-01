import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

export default function AIEvaluationLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-5 py-10"
    >
      <div className="w-12 h-12 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-300">
        <Brain className="w-6 h-6 stroke-[1.5]" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1.5 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 typing-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 typing-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 typing-dot" />
        </div>
        <p className="text-zinc-300 text-sm font-medium">Evaluating response…</p>
      </div>

      <div className="flex flex-col gap-1.5 w-60">
        {['Analyzing technical accuracy', 'Assessing communication clarity', 'Formulating feedback'].map(
          (step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.3 }}
              className="flex items-center gap-2 text-xs text-zinc-500"
            >
              <div className="w-1 h-1 rounded-full bg-zinc-600" />
              {step}
            </motion.div>
          )
        )}
      </div>
    </motion.div>
  )
}
