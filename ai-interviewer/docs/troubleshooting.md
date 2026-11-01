---
title: Troubleshooting
nav_order: 7
---

# Troubleshooting
{: .no_toc }

1. TOC
{:toc}

## Server won't start: "Postgres connection failed"

- **`DATABASE_URL is not set`:** add it to `server/.env`. The server reads that file even when started from the repo root.
- **`password authentication failed`:** the password inside the URI is wrong. For Supabase, that's the *database* password, not your account password.
- **`tenant/user … not found`:** the project ref in the Supabase pooler username (`postgres.<project-ref>`) or the region in the host is wrong. Copy the URI again from **Connect → Session pooler**.
- **`self-signed certificate in certificate chain`:** you're using a non-Supabase host with a private CA. Set `DATABASE_SSL_CA=/path/to/ca.pem`, or as a last resort `DATABASE_SSL=no-verify`.
- **`ENETUNREACH` / IPv6 address:** you used Supabase's *direct* connection. Use the **Session pooler** URI.

## "AI rate limit reached — wait a minute and try again"

You hit Groq's free-tier limit for the chat model (30 requests a minute, 1,000 a day). Wait a minute, or upgrade your Groq plan.

## The interviewer's voice sounds robotic

The browser voice has taken over from Groq Orpheus. Check the browser console for `Groq TTS unavailable, using the browser voice:`. The reason follows:

- **`…terms accepted in the Groq console`:** accept them once at the [Orpheus playground](https://console.groq.com/playground?model=canopylabs%2Forpheus-v1-english).
- **`AI rate limit reached`:** the Orpheus free tier is about 100 requests and ~3.6K characters a day. The Groq voice is retried 2 minutes after a rate limit, and resets daily.
- **`Server-side speech is disabled`:** `TTS_PROVIDER=browser` is set on the server.

## No voice at all

- Make sure **Voice On** is shown in the interview header. It's a mute toggle.
- Browsers block audio until you interact with the page; the **Start Interview** click counts. If you reloaded mid-interview, start a new one.
- On Linux without speech-dispatcher, the browser has no voices, so the fallback is silent. The interview still continues; read the question on screen.

## The mic doesn't work / "Microphone unavailable"

- The page must be served over `https://` or from `localhost`. On `http://<lan-ip>` browsers disable the microphone, and you'll get the text box instead.
- Allow microphone access in the browser's site settings, then reload.
- **"No audio was captured"** means the recording was empty. Check that the right input device is selected in your OS.

## "That answer is already being evaluated"

The same answer was submitted twice, for example a double click. The first submission is still being scored, so wait for it. If the server crashed mid-evaluation, the claim expires after 2 minutes.

## Google sign-in: "The given origin is not allowed for the given client ID"

Add the exact origin you're using (scheme, host and port, e.g. `http://localhost:5173`) under **Authorized JavaScript origins** for your OAuth client in Google Cloud Console. Google accepts only `localhost` or `https` origins, so a LAN IP over plain HTTP can't be used. Email and password sign-in always works.

## Vite fails with "Cannot find native binding"

`node_modules` was installed on a different OS (for example Windows) and lacks the Linux native packages. Reinstall on this machine:

```bash
cd client && rm -rf node_modules && npm ci
```
