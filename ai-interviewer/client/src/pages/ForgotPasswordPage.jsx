import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, KeyRound, MailCheck } from 'lucide-react'
import { forgotPassword } from '../api/authApi'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address.')
      return
    }
    try {
      setIsLoading(true)
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-300 mb-3">
            {sent ? <MailCheck className="w-5 h-5 stroke-[1.5]" /> : <KeyRound className="w-5 h-5 stroke-[1.5]" />}
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">
            {sent ? 'Check your email' : 'Forgot password?'}
          </h1>
          <p className="text-zinc-400 text-xs">
            {sent
              ? 'If an account exists for that email, we sent a link to reset your password. It expires soon and works once.'
              : "Enter your email and we'll send you a link to reset your password."}
          </p>
        </div>

        <div className="rounded-lg bg-[#121214] border border-[#27272a] p-6">
          {sent ? (
            <button
              type="button"
              onClick={() => setSent(false)}
              className="w-full py-2.5 rounded-md bg-[#18181b] border border-[#27272a] hover:border-zinc-500 text-zinc-300 font-medium text-xs transition-colors"
            >
              Use a different email
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="forgot-form">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400" htmlFor="forgot-email">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-md bg-[#18181b] border border-[#27272a] text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>

              <button
                id="forgot-submit-btn"
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full py-2.5 rounded-md bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium text-xs transition-colors"
              >
                {isLoading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-zinc-500 mt-5">
          Remembered it?{' '}
          <Link to="/login" className="text-zinc-300 hover:text-white font-medium transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
