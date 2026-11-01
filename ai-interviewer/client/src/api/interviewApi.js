import axios from 'axios'

// All requests proxy through /api → port 5000 (configured in vite.config.js)
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // required so the JWT httpOnly cookie is sent with every request
  timeout: 30000,
})

// Unwrap the nested `data` field or surface a clean error message
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

export async function startInterview(config) {
  return api.post('/interview/start', config)
}

export async function submitAnswer(payload) {
  return api.post('/interview/answer', payload)
}

export async function finishInterview(sessionId) {
  return api.post('/interview/finish', { sessionId })
}

export async function exitInterview(sessionId) {
  return api.post('/interview/exit', { sessionId })
}

export async function getInterviewHistory() {
  return api.get('/interview/history')
}
