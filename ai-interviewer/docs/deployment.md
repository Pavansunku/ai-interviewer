---
title: Deployment
nav_order: 4
---

# Deployment
{: .no_toc }

The app deploys as **one Render web service**. Express serves both the API and the built React client. The data lives in **Supabase** (managed Postgres) and the AI runs on **Groq**.

1. TOC
{:toc}

## 1. Supabase (database)

1. Create a project at [supabase.com](https://supabase.com). The free tier is fine.
2. Click **Connect** in the top bar, then the **Session pooler** tab, and copy the URI:
   ```
   postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-0-<region>.pooler.supabase.com:5432/postgres
   ```
3. Replace `[YOUR-PASSWORD]` with the **database password** you chose when you created the project. That's not your Supabase login. Reset it under **Project Settings → Database** if needed.
4. Use the result as `DATABASE_URL`.

What you **don't** need: the project URL, the publishable/anon key, or the service-role key. The server talks to Postgres directly.

{: .note }
> - **Why the Session pooler?** The direct connection host is IPv6-only, and Render (like many hosts) connects over IPv4.
> - **TLS** is verified against Supabase's root CA, which is bundled in the repo.
> - **Tables** (`users`, `interviews`) are created on first start, with Row Level Security enabled and no policies. Supabase's public REST API therefore can't read them, while the server (the table owner) can.

{: .tip }
The app doesn't use Supabase's REST Data API at all. You can turn it off under **Project Settings → Data API** to shrink the exposed surface further.

## 2. Groq (AI and voice)

1. Create an API key at [console.groq.com/keys](https://console.groq.com/keys). This is `GROQ_API_KEY`.
2. Accept the Orpheus terms once at the [Orpheus playground](https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english) so the interviewer can speak with Groq's voice.

See [Configuration → Groq free-tier limits](configuration#groq-free-tier-limits) for what the free tier covers.

## 3. Render

### Option A: Blueprint (recommended)

The repo contains a `render.yaml`.

1. In the [Render dashboard](https://dashboard.render.com), click **New + → Blueprint** and pick this repository.
2. Render asks for the values marked `sync: false`:
   - `DATABASE_URL`: your Supabase Session pooler URI
   - `GROQ_API_KEY`
   - `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`: optional, and set to the same value
3. Set `FRONTEND_URL` in `render.yaml` (or in the dashboard) to your service URL.

`JWT_SECRET` is generated automatically.

### Option B: Manual web service

| Setting | Value |
|---------|-------|
| Runtime | Node |
| Build command | `npm install && cd server && npm install && cd ../client && npm install && npm run build` |
| Start command | `node server/index.js` |
| Health check path | `/api/health` |

Environment variables: `NODE_ENV=production`, `FRONTEND_URL`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `AI_PROVIDER=groq`, `GROQ_API_KEY`, `TTS_PROVIDER=groq`, and optionally the Google client IDs. See [Configuration](configuration).

## 4. Verify

1. `https://<your-service>.onrender.com/api/health` returns `{"success":true,...}`.
2. Register, run a short interview, and check that it appears on the dashboard.
3. In Supabase's **Table Editor**, the `users` and `interviews` tables show the new rows.

## Google sign-in (optional)

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth client ID** of type *Web application*.
2. Under **Authorized JavaScript origins**, add every origin you'll use: `http://localhost:5173` and your Render URL.
3. Set `GOOGLE_CLIENT_ID` (server) and `VITE_GOOGLE_CLIENT_ID` (client build) to that ID.

Signing in with Google links to an existing account with the same email. Because Google has verified the email, any password previously set on that account is removed, so only the verified owner can sign in.
