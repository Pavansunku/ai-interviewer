import { createContext, useContext, useState, useEffect } from 'react'
import { getMe, loginUser, registerUser, logoutUser, googleLogin } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true) // true while checking existing session

  // On mount, try to restore session from the httpOnly cookie
  useEffect(() => {
    getMe()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(credentials) {
    const res = await loginUser(credentials)
    setUser(res.data.user)
    return res.data.user
  }

  async function register(data) {
    const res = await registerUser(data)
    setUser(res.data.user)
    return res.data.user
  }

  async function loginWithGoogle(credential) {
    const res = await googleLogin(credential)
    setUser(res.data.user)
    return res.data.user
  }

  async function logout() {
    await logoutUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, loginWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook lives beside its provider
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
