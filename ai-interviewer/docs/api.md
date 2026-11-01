---
title: API reference
nav_order: 6
---

# API reference
{: .no_toc }

Base path is `/api`. Request and response bodies are JSON except where noted. Authentication is the `token` httpOnly cookie that register, login and Google sign-in set.

Every JSON response has this shape:

```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": "Human-readable message" }
```

1. TOC
{:toc}

## Health

### `GET /api/health`

```json
{ "success": true, "message": "AI Interviewer API is running." }
```

Unknown `/api/*` routes return `404` with the standard error shape.

## Auth

### `POST /api/auth/register`

```json
{ "fullName": "Ada Lovelace", "email": "ada@example.com", "password": "at-least-6" }
```

| Status | Meaning |
|--------|---------|
| `201` | `data.user = { _id, fullName, email }`; session cookie set |
| `400` | missing fields, invalid email, or password shorter than 6 characters |
| `409` | email already registered |

### `POST /api/auth/login`

```json
{ "email": "ada@example.com", "password": "..." }
```

`200` returns `data.user` and sets the cookie. `401` means invalid credentials. Email matching is case-insensitive.

### `POST /api/auth/forgot-password`

```json
{ "email": "ada@example.com" }
```

`200` always returns the same message, whether or not the email has an account. If it does, a single-use link is emailed (or printed in the server console when SMTP isn't configured). `400` means the email is malformed.

### `POST /api/auth/reset-password`

```json
{ "token": "<from the emailed link>", "password": "new-password" }
```

`200` updates the password and invalidates the link. `400` means the token is invalid, expired or already used, or the password is shorter than 6 characters.

### `POST /api/auth/google`

```json
{ "credential": "<Google ID token from Google Identity Services>" }
```

| Status | Meaning |
|--------|---------|
| `200` | signed in; the account is created, or linked by verified email |
| `401` | token invalid, or the Google email is not verified |
| `409` | the email is already linked to a different Google account |
| `503` | `GOOGLE_CLIENT_ID` is not configured on the server |

### `POST /api/auth/logout`

Clears the cookie.

### `GET /api/auth/me` 🔒

`200` returns `data.user`. `401` means not signed in or the session expired.

## Interview 🔒

### `POST /api/interview/start`

```json
{
  "name": "Ada",
  "role": "Backend Developer",
  "experience": "2 Years",
  "difficulty": "Medium",
  "questionCount": 10
}
```

`difficulty` is one of `Easy`, `Medium`, `Hard`. `questionCount` is a whole number from 1 to 30.

`201` returns:

```json
{
  "sessionId": "uuid",
  "welcomeMessage": "Welcome, Ada! ...",
  "firstQuestion": { "id": 1, "text": "..." },
  "totalQuestions": 10
}
```

### `POST /api/interview/answer`

```json
{ "sessionId": "uuid", "questionId": 1, "question": "(ignored)", "answer": "My answer..." }
```

The answer is evaluated against the question the server stored, so `question` is accepted for compatibility but ignored.

`200` returns:

```json
{
  "evaluation": {
    "score": 72, "technicalAccuracy": 70, "communication": 78,
    "strengths": ["..."], "weaknesses": ["..."], "feedback": "..."
  },
  "nextQuestion": { "id": 2, "text": "..." },
  "isLastQuestion": false
}
```

For the last question, `nextQuestion` is `null` and `isLastQuestion` is `true`.

| Status | Meaning |
|--------|---------|
| `404` | no such in-progress interview for this user |
| `409` | this question was already answered, or is being evaluated right now |
| `429` | Groq rate limit; wait a minute and retry |
| `502` | the AI provider failed to produce a valid response |

### `POST /api/interview/finish`

```json
{ "sessionId": "uuid" }
```

`200` returns `data.report`:

```json
{
  "candidateName": "Ada", "role": "...", "experience": "...", "difficulty": "Medium",
  "totalQuestions": 10, "questionsAnswered": 10,
  "overallScore": 74, "technicalAccuracy": 71, "communicationScore": 79,
  "strengths": ["..."], "weaknesses": ["..."], "feedback": "...",
  "suggestedTopics": ["..."],
  "questionResults": [{ "questionId": 1, "question": "...", "answer": "...", "score": 72, "...": "..." }]
}
```

The interview moves into history. Calling finish again returns `404`.

### `POST /api/interview/exit`

```json
{ "sessionId": "<uuid>" }
```

Leaves an unfinished interview. The session is discarded and nothing is added to history. It always returns `200` (including for an unknown or already-finished session, and it never touches another user's interview), so it is safe to retry.

### `GET /api/interview/history`

`200` returns `data.history`: completed interviews, newest first. Each entry has the report fields above plus `_id` (the interview id) and `date` (when it was completed).

## Voice 🔒

### `POST /api/voice/transcribe`

`multipart/form-data` with exactly one file field named `audio` (webm, ogg, mp4/m4a, mp3, wav or flac, at most 25 MB) and no other fields.

`200` returns `{ "text": "transcribed answer" }`.

| Status | Meaning |
|--------|---------|
| `400` | no audio, an extra field, or more than one file |
| `413` | file larger than 25 MB |
| `415` | unsupported audio type |
| `429` | Groq rate limit |

### `POST /api/voice/speak`

```json
{ "text": "Up to 200 characters." }
```

`200` returns `audio/wav` (24 kHz mono PCM). Any other status tells the client to use the browser voice:

| Status | Meaning |
|--------|---------|
| `400` | text empty or longer than 200 characters |
| `429` | Groq TTS rate limit or daily quota reached |
| `501` | server TTS disabled (`TTS_PROVIDER=browser`) |
| `503` | the Orpheus terms haven't been accepted in the Groq console |
