const { query } = require('../utils/db');

// History entries keep the field names the client used with Mongo (`_id`, `date`).
function toHistoryEntry(row) {
  return {
    _id: row.id,
    role: row.role,
    experience: row.experience,
    difficulty: row.difficulty,
    totalQuestions: row.total_questions,
    questionsAnswered: row.question_results.length,
    overallScore: row.overall_score,
    technicalAccuracy: row.technical_accuracy,
    communicationScore: row.communication_score,
    strengths: row.strengths || [],
    weaknesses: row.weaknesses || [],
    feedback: row.feedback,
    suggestedTopics: row.suggested_topics || [],
    questionResults: row.question_results,
    date: row.completed_at || row.created_at,
  };
}

function toSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    candidateName: row.candidate_name,
    role: row.role,
    experience: row.experience,
    difficulty: row.difficulty,
    totalQuestions: row.total_questions,
    currentQuestion: row.current_question,
    questionResults: row.question_results,
  };
}

async function createSession({ userId, candidateName, role, experience, difficulty, totalQuestions, firstQuestion }) {
  const { rows } = await query(
    `INSERT INTO interviews (user_id, candidate_name, role, experience, difficulty, total_questions, current_question)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [userId, candidateName, role, experience, difficulty, totalQuestions, JSON.stringify(firstQuestion)]
  );
  return rows[0].id;
}

// Only the owner's in-progress interview counts as a live session.
async function getActiveSession(id, userId) {
  const { rows } = await query(
    `SELECT * FROM interviews WHERE id = $1 AND user_id = $2 AND status = 'in_progress'`,
    [id, userId]
  );
  return toSession(rows[0]);
}

// Marks the current question as being evaluated, so a duplicate submit is rejected
// before it costs an LLM call. A claim older than CLAIM_TTL is considered abandoned.
const CLAIM_TTL = '2 minutes';

async function claimAnswer(id, userId, questionId) {
  const { rowCount } = await query(
    `UPDATE interviews SET answer_claimed_at = now()
     WHERE id = $1 AND user_id = $2 AND status = 'in_progress'
       AND (current_question->>'id')::int = $3
       AND (answer_claimed_at IS NULL OR answer_claimed_at < now() - $4::interval)`,
    [id, userId, questionId, CLAIM_TTL]
  );
  return rowCount === 1;
}

// Lets the candidate retry after the evaluation failed (e.g. an AI provider error).
async function releaseAnswerClaim(id, userId) {
  await query('UPDATE interviews SET answer_claimed_at = NULL WHERE id = $1 AND user_id = $2', [id, userId]);
}

// Appends the evaluated answer and moves on to the next question (null when done).
// The current_question guard makes a late duplicate of the same question a no-op.
async function recordAnswer(id, userId, answeredQuestionId, result, nextQuestion) {
  const { rowCount } = await query(
    `UPDATE interviews
     SET question_results = question_results || $3::jsonb,
         current_question = $4::jsonb,
         answer_claimed_at = NULL
     WHERE id = $1 AND user_id = $2 AND status = 'in_progress'
       AND (current_question->>'id')::int = $5`,
    [id, userId, JSON.stringify([result]), nextQuestion ? JSON.stringify(nextQuestion) : null, answeredQuestionId]
  );
  return rowCount === 1;
}

// Completes the interview only if no answer was recorded since the report was
// generated from `answeredCount` results; returns false when it went stale.
async function complete(id, userId, answeredCount, report) {
  const { rowCount } = await query(
    `UPDATE interviews
     SET status = 'completed', completed_at = now(), current_question = NULL, answer_claimed_at = NULL,
         overall_score = $3, technical_accuracy = $4, communication_score = $5,
         strengths = $6, weaknesses = $7, feedback = $8, suggested_topics = $9
     WHERE id = $1 AND user_id = $2 AND status = 'in_progress'
       AND jsonb_array_length(question_results) = $10`,
    [
      id,
      userId,
      report.overallScore,
      report.technicalAccuracy,
      report.communicationScore,
      JSON.stringify(report.strengths || []),
      JSON.stringify(report.weaknesses || []),
      report.feedback,
      JSON.stringify(report.suggestedTopics || []),
      answeredCount,
    ]
  );
  return rowCount === 1;
}

// Discards the owner's in-progress interview (the candidate chose to leave). Completed ones are kept.
async function abandon(id, userId) {
  const { rowCount } = await query(
    `DELETE FROM interviews WHERE id = $1 AND user_id = $2 AND status = 'in_progress'`,
    [id, userId]
  );
  return rowCount === 1;
}

async function listHistory(userId) {
  const { rows } = await query(
    `SELECT * FROM interviews
     WHERE user_id = $1 AND status = 'completed'
     ORDER BY completed_at DESC`,
    [userId]
  );
  return rows.map(toHistoryEntry);
}

module.exports = {
  createSession,
  getActiveSession,
  claimAnswer,
  releaseAnswerClaim,
  recordAnswer,
  complete,
  abandon,
  listHistory,
};
