---
title: Configuration
nav_order: 3
---

# Configuration
{: .no_toc }

The server reads `server/.env`, wherever it's started from. Variables already set in the environment (for example on Render) take precedence. The client reads `client/.env` at **build time**.

1. TOC
{:toc}

## Server (`server/.env`)

### Core

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `PORT` | | `10000` | HTTP port. |
| `NODE_ENV` | | – | `production` serves `client/dist` and marks cookies `Secure`. |
| `FRONTEND_URL` | | – | Allowed CORS origin, e.g. `http://localhost:5173` or your Render URL. |

### Database

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `DATABASE_URL` | ✅ | – | Postgres connection string. For Supabase, use the **Session pooler** URI. Leave out `?sslmode=`; TLS is configured by the variables below. |
| `DATABASE_SSL` | | auto | Unset: TLS with certificate verification for remote hosts, no TLS for `localhost`. `false`: never use TLS. `no-verify`: TLS without verifying the certificate (last resort). |
| `DATABASE_SSL_CA` | | – | Path to a PEM CA bundle for verifying the database certificate. Supabase hosts (`*.supabase.com`, `*.supabase.co`) automatically use the bundled Supabase root CA (`server/db/supabase-root-2021-ca.crt`, valid until 2031). |

The schema in `server/db/schema.sql` is idempotent and is applied on every start.

### Authentication

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `JWT_SECRET` | ✅ | – | Secret used to sign session tokens. Use a long random string. |
| `JWT_EXPIRES_IN` | | – | Token lifetime, e.g. `7d`. The cookie itself lasts 7 days. |
| `GOOGLE_CLIENT_ID` | | – | Enables `POST /api/auth/google`. It must equal the client's `VITE_GOOGLE_CLIENT_ID`. Without it, Google sign-in returns `503`. |

### Password reset email

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `SMTP_HOST` | | – | SMTP server used to send reset links. Without it, the link is printed in the server console instead (fine for local development). |
| `SMTP_PORT` | | `587` | SMTP port. |
| `SMTP_SECURE` | | `false` | Set `true` for port 465. |
| `SMTP_USER` / `SMTP_PASS` | | – | SMTP login. With Gmail, use an app password. |
| `SMTP_FROM` | | `SMTP_USER` | Sender shown on the email, e.g. `AI Interviewer <no-reply@example.com>`. |
| `PASSWORD_RESET_TTL_MIN` | | `30` | Minutes a reset link stays valid. |

The link points at `FRONTEND_URL`, so set it to the public site URL in production.

### AI and voice

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `AI_PROVIDER` | | `mock` | `groq` for real interviews. `mock` uses a built-in question bank and fixed scores, with no API calls. |
| `GROQ_API_KEY` | for `groq` and voice | – | From [console.groq.com/keys](https://console.groq.com/keys). Also needed for speech-to-text. |
| `GROQ_MODEL` | | `openai/gpt-oss-120b` | Chat model. It must support **strict** structured outputs (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`). |
| `GROQ_STT_MODEL` | | `whisper-large-v3-turbo` | Speech-to-text model for answers. |
| `GROQ_TTS_MODEL` | | `canopylabs/orpheus-v1-english` | Text-to-speech model for the interviewer. |
| `GROQ_TTS_VOICE` | | `hannah` | Orpheus voice. |
| `TTS_PROVIDER` | | `groq` | `groq`: Orpheus voice, falling back to the browser voice on any error. `browser`: always the browser voice, which saves Groq quota. |

## Client (`client/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `VITE_GOOGLE_CLIENT_ID` | | Google OAuth client ID. When it's unset, the "Sign in with Google" button is hidden. Add every origin you use (e.g. `http://localhost:5173`, your Render URL) under **Authorized JavaScript origins** in Google Cloud Console. |

## Groq free-tier limits

The limits that matter for this app (check your account's limits page for current values):

| Model | Used for | Free tier |
|-------|----------|-----------|
| `openai/gpt-oss-120b` | Welcome, scoring and next question, report | 30 req/min · 1,000 req/day · 8K tokens/min |
| `whisper-large-v3-turbo` | Transcribing answers | 20 req/min · 2,000 req/day |
| `canopylabs/orpheus-v1-english` | Interviewer voice | 10 req/min · 100 req/day · ~3.6K chars/day |

A 10-question interview uses about 12 LLM calls and 10 transcriptions. The Orpheus free tier covers roughly one interview a day. After that, the browser voice takes over automatically.

{: .note }
Orpheus needs a one-time terms acceptance by your Groq org admin: open the [Orpheus playground](https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english) and accept. Until then, `/api/voice/speak` returns `503` and the browser voice is used.
