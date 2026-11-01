-- Idempotent schema, applied on every server start (see utils/db.js).
-- gen_random_uuid() is built in from Postgres 13 (Supabase runs 15+).

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text NOT NULL,
  email         text NOT NULL UNIQUE,          -- stored lowercased
  password_hash text,                          -- null for Google-only accounts
  google_id     text UNIQUE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_has_credential CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL)
);

-- One row per interview. A row starts as 'in_progress' (the live session) and
-- becomes 'completed' with the final report when the candidate finishes.
CREATE TABLE IF NOT EXISTS interviews (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status              text NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress', 'completed')),
  candidate_name      text NOT NULL,
  role                text NOT NULL,
  experience          text,
  difficulty          text NOT NULL,
  total_questions     integer NOT NULL,
  current_question    jsonb,                   -- { id, text } awaiting an answer; null when done
  answer_claimed_at   timestamptz,             -- set while that answer is being evaluated
  question_results    jsonb NOT NULL DEFAULT '[]'::jsonb,
  overall_score       integer,
  technical_accuracy  integer,
  communication_score integer,
  strengths           jsonb,
  weaknesses          jsonb,
  feedback            text,
  suggested_topics    jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  completed_at        timestamptz
);

CREATE INDEX IF NOT EXISTS interviews_user_history_idx
  ON interviews (user_id, completed_at DESC)
  WHERE status = 'completed';

-- One-time password reset links. Only a SHA-256 hash of the token is stored.
CREATE TABLE IF NOT EXISTS password_resets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  text NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_resets_user_idx ON password_resets (user_id);

-- Supabase exposes the public schema through its REST Data API. RLS with no
-- policies blocks the anon/authenticated roles entirely; the server connects as
-- the table owner, which bypasses RLS.
ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;
