import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { InterviewProvider } from './context/InterviewContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'client-id-missing'}>
      <BrowserRouter>
        <AuthProvider>
          <InterviewProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#18181b',
                color: '#f4f4f5',
                border: '1px solid #27272a',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                boxShadow: 'none',
                padding: '10px 14px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#18181b' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#18181b' },
              },
              duration: 3000,
            }}
          />
        </InterviewProvider>
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
  </React.StrictMode>
)
