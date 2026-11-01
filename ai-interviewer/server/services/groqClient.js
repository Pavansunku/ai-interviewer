const Groq = require('groq-sdk');
const config = require('../config');

let client = null;

// Created on first use so the server can still boot (e.g. with AI_PROVIDER=mock) without a key
function getGroq() {
  if (!config.GROQ_API_KEY) {
    const err = new Error('GROQ_API_KEY is not set on the server.');
    err.statusCode = 500;
    throw err;
  }
  if (!client) client = new Groq({ apiKey: config.GROQ_API_KEY });
  return client;
}

// Turns a Groq SDK error into one errorHandler can return with a sensible status.
function toHttpError(err, fallbackMessage) {
  if (err.statusCode) return err;

  const status = err.status;
  const code = err.error?.error?.code || err.error?.code;
  let mapped;

  if (status === 429) {
    mapped = new Error('AI rate limit reached — wait a minute and try again.');
    mapped.statusCode = 429;
  } else if (status === 401 || status === 403) {
    mapped = new Error('AI provider rejected the server credentials (check GROQ_API_KEY).');
    mapped.statusCode = 500;
  } else if (code === 'model_terms_required') {
    mapped = new Error('This Groq model needs its terms accepted in the Groq console first.');
    mapped.statusCode = 503;
  } else {
    mapped = new Error(fallbackMessage);
    mapped.statusCode = 502;
  }
  mapped.code = code;
  return mapped;
}

module.exports = { getGroq, toHttpError };
