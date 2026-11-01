export default function QuestionPanel({ question, questionNumber, totalQuestions, welcomeMessage }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Welcome note (first question only) */}
      {questionNumber === 1 && welcomeMessage && (
        <div className="rounded-lg bg-[#121214] border border-[#27272a] p-4 text-sm text-[#a1a1aa] leading-relaxed">
          <p
            className="whitespace-pre-wrap font-sans"
            dangerouslySetInnerHTML={{ __html: welcomeMessage.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-medium">$1</strong>') }}
          />
        </div>
      )}

      {/* Question metadata label */}
      <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
        <span className="text-xs font-mono text-[#71717a] uppercase tracking-wider">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question text */}
      <h2 className="font-sans text-lg sm:text-xl font-semibold text-white leading-relaxed tracking-tight">
        {question?.text}
      </h2>
    </div>
  )
}
