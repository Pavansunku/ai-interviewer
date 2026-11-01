import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'

const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginWithGoogle } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const from = location.state?.from?.pathname || '/setup'

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields.')
      return
    }
    try {
      setIsLoading(true)
      await login(form)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    try {
      setIsLoading(true)
      await loginWithGoogle(credentialResponse.credential)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-300 mb-3">
            <LogIn className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Sign In</h1>
          <p className="text-zinc-400 text-xs">Enter your details to access your account</p>
        </div>

        {/* Card */}
        <div className="rounded-lg bg-[#121214] border border-[#27272a] p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="login-form">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-zinc-400" htmlFor="login-email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-md bg-[#18181b] border border-[#27272a] text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-zinc-400" htmlFor="login-password">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-md bg-[#18181b] border border-[#27272a] text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
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

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-2.5 rounded-md bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-950/20 border-t-zinc-950 animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider + Google sign-in — only when a Google client ID is configured */}
          {GOOGLE_ENABLED && (
            <>
              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#27272a]" />
                <span className="text-[11px] font-mono text-zinc-500 uppercase">
                  Or
                </span>
                <div className="flex-1 h-px bg-[#27272a]" />
              </div>

              {/* Google Login */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Sign-In failed')}
                  theme="filled_black"
                  shape="pill"
                  text="signin_with"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-zinc-500 mt-5">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-zinc-300 hover:text-white font-medium transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}
