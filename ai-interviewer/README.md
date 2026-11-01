# AI Interviewer

[![CI](https://github.com/Pavansunku/ai-interviewer/actions/workflows/ci.yml/badge.svg)](https://github.com/Pavansunku/ai-interviewer/actions/workflows/ci.yml)
[![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://Pavansunku.github.io/ai-interviewer/)

Practice technical interviews out loud. An AI interviewer asks role-specific questions in a natural voice, listens to your spoken answers, scores each one, and writes a final report with strengths, gaps and topics to study.

![Interview in progress](docs/assets/images/interview.png)

**📖 Documentation: [Pavansunku.github.io/ai-interviewer](https://Pavansunku.github.io/ai-interviewer/)**

## Features

- **Voice in, voice out:** questions are spoken with Groq Orpheus, and answers are transcribed by Groq Whisper. It works in every modern browser.
- **Automatic fallback** to the browser's own voice when Groq text-to-speech is unavailable.
- **Adaptive questions and per-answer scoring** from `openai/gpt-oss-120b` on Groq, using strict JSON outputs.
- **Final report and history:** overall, technical and communication scores, strengths, weaknesses and study topics, saved to a dashboard.
- **Accounts:** email and password, plus optional Google sign-in. Sessions use httpOnly JWT cookies.
- **Restart-safe interviews** stored in Postgres (Supabase), with per-user ownership checks.

## Quick start

```bash
git clone https://github.com/Pavansunku/ai-interviewer.git && cd ai-interviewer
npm run install-all

# Postgres (or use Supabase — see docs)
docker run -d --name interview-pg -p 127.0.0.1:5432:5432 \
  -e POSTGRES_USER=interview -e POSTGRES_PASSWORD=interview -e POSTGRES_DB=interview postgres:16-alpine

cp server/.env.example server/.env   # set DATABASE_URL, JWT_SECRET, GROQ_API_KEY

cd server && npm run dev             # API → http://localhost:5000
cd client && npm run dev             # UI  → http://localhost:5173
```

Full guide: [Getting started](https://Pavansunku.github.io/ai-interviewer/getting-started).

## Stack

| Layer | Technology |
|-------|------------|
| Client | React 19 · Vite 8 · Tailwind CSS 4 · Framer Motion |
| Server | Node.js 22 · Express 5 · `pg` · `groq-sdk` |
| Database | PostgreSQL (Supabase) |
| AI | Groq: `openai/gpt-oss-120b`, `whisper-large-v3-turbo`, `canopylabs/orpheus-v1-english` |
| Hosting | Render (single web service), defined in `render.yaml` |

## Documentation

| | |
|---|---|
| [Getting started](https://Pavansunku.github.io/ai-interviewer/getting-started) | Local setup |
| [Configuration](https://Pavansunku.github.io/ai-interviewer/configuration) | Environment variables, Groq limits |
| [Deployment](https://Pavansunku.github.io/ai-interviewer/deployment) | Supabase, Groq, Render |
| [Architecture](https://Pavansunku.github.io/ai-interviewer/architecture) | Voice pipeline, interview state machine, data model |
| [API reference](https://Pavansunku.github.io/ai-interviewer/api) | REST endpoints |
| [Troubleshooting](https://Pavansunku.github.io/ai-interviewer/troubleshooting) | Common problems |

The docs live in [`docs/`](docs/) and are published with GitHub Pages.

## Testing

```bash
cd client && npm run lint && npm run build
cd server && DATABASE_URL=postgresql://interview:interview@localhost:5432/interview JWT_SECRET=dev npm run smoke
```

CI runs both on every push and pull request.
