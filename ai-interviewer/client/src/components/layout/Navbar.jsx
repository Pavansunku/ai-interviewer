import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Brain, LogOut, User, LayoutDashboard, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const isLanding = location.pathname === '/'
  const isAuth = location.pathname === '/login' || location.pathname === '/register'

  async function handleLogout() {
    await logout()
    toast.success('Signed out.')
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-[#09090b]/90 backdrop-blur-md border-b border-[#27272a]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-[#18181b] border border-[#27272a] flex items-center justify-center text-white">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <span className="font-sans font-semibold text-sm text-white tracking-tight">
            AInterviewer
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* User badge */}
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#18181b] border border-[#27272a]">
                <User className="w-3 h-3 text-[#a1a1aa]" />
                <span className="text-xs text-[#d4d4d8] font-mono">{user?.fullName?.split(' ')[0]}</span>
              </div>

              {/* Dashboard link */}
              <Link
                id="navbar-dashboard-link"
                to="/dashboard"
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors duration-150 px-2.5 py-1 rounded-md ${
                  location.pathname === '/dashboard'
                    ? 'text-white bg-[#18181b]'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* Logout */}
              <button
                id="navbar-logout-btn"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#f4f4f5] transition-colors duration-150 px-2 py-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              {!isAuth && (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-xs sm:text-sm text-[#a1a1aa] hover:text-white transition-colors duration-150 font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 transition-colors duration-150"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Back to Home on internal pages when not authenticated */}
          {!isLanding && !isAuth && !isAuthenticated && (
            <Link
              to="/"
              className="text-xs text-[#a1a1aa] hover:text-white transition-colors duration-150 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
