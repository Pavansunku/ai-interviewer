import axios from 'axios'

// Separate instance from authApi/interviewApi: their JSON Content-Type default
// would make axios serialise FormData uploads as JSON.
const api = axios.create({
  baseURL: '/api/voice',
  withCredentials: true, // the JWT httpOnly cookie authenticates these routes too
  timeout: 30000,
})

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    let message = error.response?.data?.error
    // With responseType 'blob' the JSON error body arrives as a Blob
    if (!message && error.response?.data instanceof Blob) {
      try {
        message = JSON.parse(await error.response.data.text()).error
      } catch {
        // not JSON — keep the generic message
      }
    }
    const err = new Error(message || error.message || 'Voice request failed.')
    err.status = error.response?.status
    err.canceled = axios.isCancel(error)
    return Promise.reject(err)
  }
)

const EXTENSIONS = { 'audio/webm': 'webm', 'audio/mp4': 'mp4', 'audio/ogg': 'ogg', 'audio/wav': 'wav' }

// Groq Whisper → { success, data: { text } }
export async function transcribeAudio(blob, signal) {
  const ext = EXTENSIONS[blob.type.split(';')[0]] || 'webm'
  const form = new FormData()
  form.append('audio', blob, `answer.${ext}`)
  return api.post('/transcribe', form, { signal })
}

// Groq Orpheus (≤200 characters) → WAV Blob
export async function synthesizeSpeech(text, signal) {
  return api.post('/speak', { text }, { responseType: 'blob', signal })
}
