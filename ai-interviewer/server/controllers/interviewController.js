const aiService = require('../services/aiService');
const Interview = require('../models/interview');
const { UUID_RE } = require('../models/user');

const MAX_QUESTIONS = 30;

// Live sessions are `in_progress` rows in the interviews table, scoped to the
// logged-in user, so they survive server restarts and can't be used by anyone else.
async function loadSession(req, res) {
  const { sessionId } = req.body;
  const session = UUID_RE.test(sessionId) ? await Interview.getActiveSession(sessionId, req.user._id) : null;
  if (!session) {
    res.status(404).json({ success: false, error: 'Session not found. Please start a new interview.' });
  }
  return session;
}

async function startInterview(req, res, next) {
  try {
    const { name, role, experience, difficulty, questionCount } = req.body;

    if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > MAX_QUESTIONS) {
      return res.status(400).json({ success: false, error: `"questionCount" must be a whole number from 1 to ${MAX_QUESTIONS}.` });
    }

    const { welcomeMessage, firstQuestion } = await aiService.generateWelcomeAndFirstQuestion({
      name,
      role,
      difficulty,
      questionCount,
    });

    const sessionId = await Interview.createSession({
      userId: req.user._id,
      candidateName: name,
      role,
      experience,
      difficulty,
      totalQuestions: questionCount,
      firstQuestion,
    });

    res.status(201).json({
      success: true,
      data: { sessionId, welcomeMessage, firstQuestion, totalQuestions: questionCount },
    });
  } catch (err) {
    next(err);
  }
}

async function submitAnswer(req, res, next) {
  try {
    const { questionId, answer } = req.body;

    const session = await loadSession(req, res);
    if (!session) return;

    // Evaluate against the question the server asked, not text supplied by the client
    const current = session.currentQuestion;
    if (!current || current.id !== questionId) {
      return res.status(409).json({ success: false, error: 'That question has already been answered.' });
    }

    // Claim the question first so a duplicate submit doesn't trigger a second LLM call
    if (!(await Interview.claimAnswer(session.id, req.user._id, current.id))) {
      return res.status(409).json({ success: false, error: 'That answer is already being evaluated.' });
    }

    // Pass previously asked questions so the model won't repeat them
    const previousQuestions = session.questionResults.map((r) => r.question);

    let result;
    try {
      result = await aiService.evaluateAnswer({
        role: session.role,
        difficulty: session.difficulty,
        questionIndex: current.id,
        question: current.text,
        answer,
        totalQuestions: session.totalQuestions,
        previousQuestions,
      });
    } catch (err) {
      await Interview.releaseAnswerClaim(session.id, req.user._id).catch(() => {});
      throw err;
    }

    const recorded = await Interview.recordAnswer(
      session.id,
      req.user._id,
      current.id,
      {
        questionId: current.id,
        question: current.text,
        answer,
        score: result.evaluation.score,
        technicalAccuracy: result.evaluation.technicalAccuracy,
        communication: result.evaluation.communication,
        strengths: result.evaluation.strengths,
        weaknesses: result.evaluation.weaknesses,
        feedback: result.evaluation.feedback,
      },
      result.nextQuestion
    );

    // A concurrent submit for the same question got there first
    if (!recorded) {
      return res.status(409).json({ success: false, error: 'That question has already been answered.' });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function finishInterview(req, res, next) {
  try {
    let session = await loadSession(req, res);
    if (!session) return;

    // An answer recorded while the report was being written would be missing from
    // it, so completion is conditional on the answer count; regenerate once if stale.
    for (let attempt = 1; ; attempt++) {
      const reportData = await aiService.generateReport({
        candidateName: session.candidateName,
        role: session.role,
        difficulty: session.difficulty,
        questionResults: session.questionResults,
      });

      // ── Persist the report onto the interview row (moves it into history) ──
      const completed = await Interview.complete(
        session.id,
        req.user._id,
        session.questionResults.length,
        reportData
      );

      if (completed) {
        const report = {
          candidateName: session.candidateName,
          role: session.role,
          experience: session.experience,
          difficulty: session.difficulty,
          totalQuestions: session.totalQuestions,
          questionsAnswered: session.questionResults.length,
          questionResults: session.questionResults,
          ...reportData,
        };
        return res.json({ success: true, data: { report } });
      }

      session = await loadSession(req, res); // 404 if another request already finished it
      if (!session) return;
      if (attempt >= 2) {
        return res.status(409).json({ success: false, error: 'The interview changed while finishing. Please try again.' });
      }
    }
  } catch (err) {
    next(err);
  }
}

// ── POST /api/interview/exit ──────────────────────────────────────────────────
// The candidate leaves without finishing: the unfinished session is discarded and
// nothing is added to history. Safe to repeat, so a retry after a network error is fine.
async function exitInterview(req, res, next) {
  try {
    const { sessionId } = req.body;
    if (UUID_RE.test(sessionId)) {
      await Interview.abandon(sessionId, req.user._id);
    }
    res.json({ success: true, message: 'Interview ended without saving.' });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/interview/history ────────────────────────────────────────────────
async function getHistory(req, res, next) {
  try {
    const history = await Interview.listHistory(req.user._id);
    res.json({ success: true, data: { history } });
  } catch (err) {
    next(err);
  }
}

module.exports = { startInterview, submitAnswer, finishInterview, exitInterview, getHistory };
