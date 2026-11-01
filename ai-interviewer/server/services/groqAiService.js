const config = require('../config');
const { getGroq, toHttpError } = require('./groqClient');

// ── JSON schemas (Groq strict structured outputs: every property required,
// no additional properties) ────────────────────────────────────────────────────
const stringArray = { type: 'array', items: { type: 'string' } };

const SCHEMAS = {
  welcome: {
    type: 'object',
    properties: {
      welcomeMessage: { type: 'string' },
      firstQuestion: { type: 'string' },
    },
    required: ['welcomeMessage', 'firstQuestion'],
    additionalProperties: false,
  },
  evaluation: {
    type: 'object',
    properties: {
      score: { type: 'integer' },
      technicalAccuracy: { type: 'integer' },
      communication: { type: 'integer' },
      strengths: stringArray,
      weaknesses: stringArray,
      feedback: { type: 'string' },
      nextQuestion: { type: 'string' },
    },
    required: ['score', 'technicalAccuracy', 'communication', 'strengths', 'weaknesses', 'feedback', 'nextQuestion'],
    additionalProperties: false,
  },
  report: {
    type: 'object',
    properties: {
      feedback: { type: 'string' },
      strengths: stringArray,
      weaknesses: stringArray,
      suggestedTopics: stringArray,
    },
    required: ['feedback', 'strengths', 'weaknesses', 'suggestedTopics'],
    additionalProperties: false,
  },
};

// The last-question evaluation has no next question to generate
SCHEMAS.finalEvaluation = {
  ...SCHEMAS.evaluation,
  properties: Object.fromEntries(Object.entries(SCHEMAS.evaluation.properties).filter(([k]) => k !== 'nextQuestion')),
  required: SCHEMAS.evaluation.required.filter((k) => k !== 'nextQuestion'),
};

// Strip markdown code fences in case a model wraps its JSON anyway
function parseJSON(text) {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Invalid Groq JSON:", text);
    throw new Error("Groq returned invalid JSON.");
  }
}

// Groq occasionally rejects a strict-schema generation (400 json_validate_failed,
// often with an empty output); a fresh sample almost always succeeds.
const MAX_ATTEMPTS = 3;

async function callGroq(prompt, schemaName) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await getGroq().chat.completions.create({
        model: config.GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: {
          type: 'json_schema',
          json_schema: { name: schemaName, strict: true, schema: SCHEMAS[schemaName] },
        },
        reasoning_effort: 'low',
        temperature: 0.6,
        max_completion_tokens: 2048, // includes the model's reasoning tokens
      });

      return parseJSON(response.choices[0]?.message?.content || '');
    } catch (err) {
      const code = err.error?.error?.code || err.error?.code;
      const retryable = code === 'json_validate_failed' || err.message === "Groq returned invalid JSON.";
      console.error(`Groq Error (${schemaName}, attempt ${attempt}/${MAX_ATTEMPTS}):`, err.status || '', code || err.message);

      if (!retryable || attempt >= MAX_ATTEMPTS) {
        throw toHttpError(err, "Failed to generate AI response.");
      }
    }
  }
}

async function generateWelcomeAndFirstQuestion({ name, role, difficulty, questionCount }) {
  const prompt = `You are a professional AI technical interviewer on an interview practice platform.

Generate a welcome message and the first interview question for this session.

Candidate: ${name}
Role: ${role} Developer
Difficulty: ${difficulty}
Total Questions in session: ${questionCount}

Respond ONLY with a JSON object in this exact format, no extra text:
{
  "welcomeMessage": "A warm 2-3 sentence welcome. Mention the candidate's name, role, difficulty level, and question count.",
  "firstQuestion": "The first interview question. For Easy: open with a self-introduction question about their ${role} journey. For Medium: ask about a specific technology challenge. For Hard: ask about architecture, design decisions, or complex trade-offs."
}`;

  const data = await callGroq(prompt, 'welcome');

  if (
    !data ||
    typeof data.welcomeMessage !== 'string' ||
    !data.welcomeMessage.trim() ||
    typeof data.firstQuestion !== 'string' ||
    !data.firstQuestion.trim()
  ) {
    console.error("Malformed welcome/first-question response:", data);
    throw new Error("Invalid Groq response: missing welcomeMessage or firstQuestion.");
  }

  return {
    welcomeMessage: data.welcomeMessage,
    firstQuestion: { id: 1, text: data.firstQuestion },
  };
}

async function evaluateAnswer({
  role,
  difficulty,
  questionIndex,
  question,
  answer,
  totalQuestions,
  previousQuestions = [],
}) {
  const isLastQuestion = questionIndex >= totalQuestions;

  const askedQuestionsBlock = previousQuestions.length
    ? `Questions already asked in this session (do NOT repeat any of these, or close variants of them):
${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
`
    : '';

  const prompt = `You are an expert technical interviewer evaluating a candidate's answer during a mock interview.

Role: ${role} Developer
Difficulty: ${difficulty}
Question (${questionIndex} of ${totalQuestions}): "${question}"
Candidate's Answer: "${answer?.trim() || '(no answer given)'}"

${askedQuestionsBlock}
Your tasks:
1. Evaluate the answer quality (score, technical accuracy, communication clarity)
2. ${isLastQuestion ? 'This is the LAST question — do not generate another question.' : `Generate the NEXT interview question for question ${questionIndex + 1} of ${totalQuestions}, appropriate for a ${role} ${difficulty} interview. It must be new and not a repeat or rephrasing of any question already asked.`}

Respond ONLY with a JSON object, no extra text:
{
  "score": <integer 0-100, based on answer quality>,
  "technicalAccuracy": <integer 0-100, for technical correctness>,
  "communication": <integer 0-100, for clarity and structure>,
  "strengths": ["<one specific strength>", "<another specific strength>"],
  "weaknesses": ["<one specific area to improve>", "<another area>"],
  "feedback": "<2-3 sentences of specific, constructive feedback on this answer>"${isLastQuestion ? '' : `,
  "nextQuestion": "<the next interview question>"`}
}

Scoring rules:
- 85-100: Comprehensive answer with examples, edge cases, and depth
- 70-84: Good answer covering main points
- 50-69: Partial answer, missing key aspects
- 30-49: Vague or mostly incorrect
- 0-29: No answer or completely off-topic`;

  const data = await callGroq(prompt, isLastQuestion ? 'finalEvaluation' : 'evaluation');
  if (data && isLastQuestion) data.nextQuestion = null;

  const isValidScore = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100;

  if (
    !data ||
    !isValidScore(Number(data.score)) ||
    !isValidScore(Number(data.technicalAccuracy)) ||
    !isValidScore(Number(data.communication)) ||
    typeof data.feedback !== 'string' ||
    !data.feedback.trim() ||
    (!isLastQuestion && (typeof data.nextQuestion !== 'string' || !data.nextQuestion.trim()))
  ) {
    console.error("Malformed evaluateAnswer response:", data);
    throw new Error("Invalid Groq response: missing or malformed evaluation fields.");
  }

  const strengths = Array.isArray(data.strengths)
    ? data.strengths.filter((s) => typeof s === 'string' && s.trim())
    : [data.strengths].filter((s) => typeof s === 'string' && s.trim());

  const weaknesses = Array.isArray(data.weaknesses)
    ? data.weaknesses.filter((s) => typeof s === 'string' && s.trim())
    : [data.weaknesses].filter((s) => typeof s === 'string' && s.trim());

  return {
    evaluation: {
      score: Number(data.score),
      technicalAccuracy: Number(data.technicalAccuracy),
      communication: Number(data.communication),
      strengths,
      weaknesses,
      feedback: data.feedback,
    },
    nextQuestion: data.nextQuestion && !isLastQuestion ? { id: questionIndex + 1, text: data.nextQuestion } : null,
    isLastQuestion,
  };
}

async function generateReport({ candidateName, role, difficulty, questionResults }) {
  if (questionResults.length === 0) {
    return {
      overallScore: 0,
      technicalAccuracy: 0,
      communicationScore: 0,
      strengths: [],
      weaknesses: [],
      feedback: 'No questions were answered.',
      suggestedTopics: [],
    };
  }

  const avg = (arr) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
  const overallScore = avg(questionResults.map((r) => r.score));
  const technicalAccuracy = avg(questionResults.map((r) => r.technicalAccuracy));
  const communicationScore = avg(questionResults.map((r) => r.communication));

  // Include the candidate's actual answers (truncated) so the report reflects
  // what they said, not just the scores.
  const MAX_ANSWER_CHARS = 500;
  const truncate = (str = '') =>
    str.length > MAX_ANSWER_CHARS ? `${str.slice(0, MAX_ANSWER_CHARS)}…` : str;

  const qaSummary = questionResults
    .map((r, i) => {
      const answerText = truncate((r.answer || '(no answer given)').trim());
      return `Q${i + 1} (score ${r.score}/100): "${r.question}"\nCandidate's Answer: "${answerText}"`;
    })
    .join('\n\n');

  const allStrengths = [...new Set(questionResults.flatMap((r) => r.strengths))].join(', ');
  const allWeaknesses = [...new Set(questionResults.flatMap((r) => r.weaknesses))].join(', ');

  const prompt = `You are an expert technical interviewer writing a final candidate assessment report.

Candidate: ${candidateName}
Role: ${role} Developer
Difficulty: ${difficulty}
Computed Scores — Overall: ${overallScore}/100 | Technical: ${technicalAccuracy}/100 | Communication: ${communicationScore}/100

Questions and the candidate's actual answers:
${qaSummary}

Observed strengths so far: ${allStrengths}
Observed weaknesses so far: ${allWeaknesses}

Base your assessment on the actual content of the candidate's answers above, not just the numeric scores.

Write a holistic final report. Respond ONLY with a JSON object, no extra text:
{
  "feedback": "<3-4 sentence personalized overall assessment. Address the candidate by name. Be honest but encouraging. Reference their score level and key patterns, referring to specifics from their answers where relevant.>",
  "strengths": ["<consolidated strength 1>", "<consolidated strength 2>", "<consolidated strength 3>"],
  "weaknesses": ["<area to improve 1>", "<area to improve 2>", "<area to improve 3>"],
  "suggestedTopics": ["<specific topic to study 1>", "<specific topic 2>", "<specific topic 3>", "<specific topic 4>", "<specific topic 5>"]
}

Suggested topics must be specific (e.g. "React Reconciliation & Fiber Algorithm" not just "React").
Give ${overallScore < 60 ? '5' : '3'} suggested topics.`;

  const data = await callGroq(prompt, 'report');

  const isNonEmptyStringArray = (arr) =>
    Array.isArray(arr) && arr.length > 0 && arr.every((s) => typeof s === 'string' && s.trim());

  if (
    !data ||
    typeof data.feedback !== 'string' ||
    !data.feedback.trim() ||
    !isNonEmptyStringArray(data.strengths) ||
    !isNonEmptyStringArray(data.weaknesses) ||
    !isNonEmptyStringArray(data.suggestedTopics)
  ) {
    console.error("Malformed generateReport response:", data);
    throw new Error("Invalid Groq response: missing or malformed report fields.");
  }

  return {
    overallScore,
    technicalAccuracy,
    communicationScore,
    strengths: data.strengths,
    weaknesses: data.weaknesses,
    feedback: data.feedback,
    suggestedTopics: data.suggestedTopics,
  };
}

module.exports = { generateWelcomeAndFirstQuestion, evaluateAnswer, generateReport };