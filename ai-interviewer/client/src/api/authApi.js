import axios from 'axios'

// Shares the same axios instance pattern as interviewApi — proxied to port 5000
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // required for httpOnly cookies to be sent/received
  timeout: 15000,
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred.'
    return Promise.reject(new Error(message))
  }
)

export async function registerUser(data) {
  return api.post('/auth/register', data)
}

export async function loginUser(data) {
  return api.post('/auth/login', data)
}

export async function logoutUser() {
  return api.post('/auth/logout')
}

export async function getMe() {
  return api.get('/auth/me')
}

export async function googleLogin(credential) {
  return api.post('/auth/google', { credential })
}

export async function forgotPassword(email) {
  return api.post('/auth/forgot-password', { email })
}

export async function resetPassword(token, password) {
  return api.post('/auth/reset-password', { token, password })
}
