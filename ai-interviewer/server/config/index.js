// Load server/.env whatever the working directory (the root `npm start` runs from the repo root);
// variables already set in the environment (e.g. on Render) take precedence
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });

module.exports = {
  PORT: process.env.PORT,
  FRONTEND_URL: process.env.FRONTEND_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_SSL: process.env.DATABASE_SSL, // unset (auto) | "false" | "no-verify" — see utils/db.js
  DATABASE_SSL_CA: process.env.DATABASE_SSL_CA, // optional path to a PEM CA for the database
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,

  // Password reset emails. Without SMTP_HOST the reset link is printed in the server console instead.
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true', // true for port 465
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM || process.env.SMTP_USER || 'AI Interviewer <no-reply@localhost>',
  PASSWORD_RESET_TTL_MIN: Number(process.env.PASSWORD_RESET_TTL_MIN) || 30,

  AI_PROVIDER: process.env.AI_PROVIDER,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  GROQ_STT_MODEL: process.env.GROQ_STT_MODEL || 'whisper-large-v3-turbo',
  GROQ_TTS_MODEL: process.env.GROQ_TTS_MODEL || 'canopylabs/orpheus-v1-english',
  GROQ_TTS_VOICE: process.env.GROQ_TTS_VOICE || 'hannah',
  TTS_PROVIDER: process.env.TTS_PROVIDER || 'groq', // "groq" | "browser"
};
