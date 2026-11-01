import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'

const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loginWithGoogle } = useAuth()

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      toast.error('Please fill in all fields.')
      return
    }
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
      await register({ fullName: form.fullName, email: form.email, password: form.password })
      toast.success('Account created!')
      navigate('/setup')
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
      toast.success('Account created!')
      navigate('/setup')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fields = [
    { id: 'reg-fullname', name: 'fullName', label: 'Full name', type: 'text', placeholder: 'Alex Chen', icon: User, autoComplete: 'name' },
    { id: 'reg-email', name: 'email', label: 'Email address', type: 'email', placeholder: 'name@example.com', icon: Mail, autoComplete: 'email' },
  ]

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-300 mb-3">
            <UserPlus className="w-5 h-5 stroke-[1.5]" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Create Account</h1>
          <p className="text-zinc-400 text-xs">Sign up to track and improve your interview skills</p>
        </div>

        {/* Card */}
        <div className="rounded-lg bg-[#121214] border border-[#27272a] p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="register-form">
            {/* Text fields */}
            {fields.map(({ id, name, label, type, placeholder, icon: Icon, autoComplete }) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-zinc-400" htmlFor={id}>{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    id={id}
                    name={name}
                    type={type}
                    autoComplete={autoComplete}
                    value={form[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-md bg-[#18181b] border border-[#27272a] text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>
            ))}

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-zinc-400" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
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

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-zinc-400" htmlFor="reg-confirm-password">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-md bg-[#18181b] border border-[#27272a] text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
            </div>

            {/* Password indicator */}
            {form.password.length > 0 && (
              <div className="flex items-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-0.5 flex-1 rounded-full ${
                      form.password.length >= 10 ? 'bg-zinc-200' :
                      form.password.length >= 6 ? (i < 2 ? 'bg-zinc-400' : 'bg-zinc-800') :
                      (i === 0 ? 'bg-zinc-500' : 'bg-zinc-800')
                    }`}
                  />
                ))}
                <span className="text-[10px] font-mono text-zinc-500">
                  {form.password.length >= 10 ? 'Strong' : form.password.length >= 6 ? 'Medium' : 'Short'}
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full py-2.5 rounded-md bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-950/20 border-t-zinc-950 animate-spin" />
                  Creating account…
                </span>
              ) : (
                'Create Account'
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
                  onError={() => toast.error('Google Sign-Up failed')}
                  theme="filled_black"
                  shape="pill"
                  text="signup_with"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-zinc-500 mt-5">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-zinc-300 hover:text-white font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
