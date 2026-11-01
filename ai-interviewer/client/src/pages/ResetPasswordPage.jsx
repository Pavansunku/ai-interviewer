import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { resetPassword } from '../api/authApi'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    try {
      setIsLoading(true)
      await resetPassword(token, form.password)
      toast.success('Password updated. Please sign in.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">Invalid reset link</h1>
          <p className="text-zinc-400 text-xs mb-5">This link is missing its token. Request a new one.</p>
          <Link to="/forgot-password" className="text-zinc-300 hover:text-white text-xs font-medium transition-colors">
            Send a new reset link
          </Link>
        </div>
      </main>
    )
  }

  const inputClass =
    'w-full pl-9 pr-10 py-2.5 rounded-md bg-[#18181b] border border-[#27272a] text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition-colors'

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-300 mb-3">
            <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Set a new password</h1>
          <p className="text-zinc-400 text-xs">Choose a password with at least 6 characters.</p>
        </div>

        <div className="rounded-lg bg-[#121214] border border-[#27272a] p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="reset-form">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-zinc-400" htmlFor="reset-password">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="reset-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-zinc-400" htmlFor="reset-confirm">
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="reset-confirm"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>

            <button
              id="reset-submit-btn"
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-2.5 rounded-md bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium text-xs transition-colors"
            >
              {isLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
