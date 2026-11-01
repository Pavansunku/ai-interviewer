---
title: Getting started
nav_order: 2
---

# Getting started
{: .no_toc }

1. TOC
{:toc}

## Prerequisites

- **Node.js 22 LTS** and npm (Vite 8 needs at least 20.19)
- **PostgreSQL 13+**: a local Docker container, or a free [Supabase](https://supabase.com) project
- **A Groq API key** from [console.groq.com/keys](https://console.groq.com/keys). The free tier is enough.

## 1. Clone and install

```bash
git clone https://github.com/harshithsunku/ai-interviewer.git
cd ai-interviewer
npm run install-all
```

`install-all` installs the root, `server/` and `client/` dependencies.

## 2. Start a database

The quickest option is a local Postgres in Docker:

```bash
docker run -d --name interview-pg -p 127.0.0.1:5432:5432 \
  -e POSTGRES_USER=interview -e POSTGRES_PASSWORD=interview -e POSTGRES_DB=interview \
  postgres:16-alpine
```

To use Supabase instead, see [Deployment → Supabase](deployment#1-supabase-database).

You don't need to run a migration. The server creates its tables on startup (`server/db/schema.sql`).

## 3. Configure the server

```bash
cp server/.env.example server/.env
```

Then edit `server/.env`. At minimum:

```bash
DATABASE_URL=postgresql://interview:interview@localhost:5432/interview
JWT_SECRET=<any long random string>
AI_PROVIDER=groq
GROQ_API_KEY=gsk_...
```

[Configuration](configuration) lists every option.

{: .note }
> **No Groq key yet?** Set `AI_PROVIDER=mock` and `TTS_PROVIDER=browser`. Questions then come from a built-in question bank and the browser's voice reads them. Spoken answers still need Groq Whisper, so without a key, transcription fails with an error.

## 4. Run it

In two terminals:

```bash
cd server && npm run dev     # API on http://localhost:5000
```

```bash
cd client && npm run dev     # UI on http://localhost:5173 (proxies /api to :5000)
```

Open **http://localhost:5173**, create an account, and start an interview.

## How an interview works

1. **Setup:** choose a role, experience level, difficulty, and 5–20 questions.
2. Click **Start Interview**. The page goes fullscreen and the interviewer greets you and asks question 1.
3. Click the **mic**, answer out loud, and click the mic again. Your answer is transcribed and shown so you can check it.
4. Click **Submit Answer**. You hear your score and feedback, then the next question.
5. After the last question you get a full **report**. Every completed interview appears on your **dashboard**.

{: .warning }
> **Interview integrity:** switching tabs, leaving fullscreen, or pressing Back during an interview counts as a violation. After 3 violations the interview ends automatically.

## Testing from another device

Browsers only allow microphone access on `https://` or `localhost`. Plain `http://<lan-ip>:5173` works, but you'll get the "type your answer" fallback. For real voice testing from a phone or another PC, put the dev server behind HTTPS (for example a reverse proxy with a self-signed certificate), or use an SSH tunnel so the page loads from `localhost`.

## Smoke test

A full API run-through against your database, using the mock AI with no Groq calls. CI runs the same test on every push.

```bash
cd server
DATABASE_URL=postgresql://interview:interview@localhost:5432/interview JWT_SECRET=dev npm run smoke
```

## Production build

```bash
npm run build                      # installs deps and builds client/dist
NODE_ENV=production npm start      # Express serves the API and client/dist on $PORT
```
