const bcrypt = require('bcrypt');
const { query } = require('../utils/db');

const SALT_ROUNDS = 10;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// API shape the client already relies on (kept from the Mongo days: `_id`).
function toPublic(row) {
  if (!row) return null;
  return { _id: row.id, fullName: row.full_name, email: row.email };
}

async function findById(id) {
  // Tokens issued before the Postgres move carry Mongo ObjectIds; treat them as unknown users
  if (typeof id !== 'string' || !UUID_RE.test(id)) return null;
  const { rows } = await query('SELECT id, full_name, email FROM users WHERE id = $1', [id]);
  return toPublic(rows[0]);
}

// Returns the raw row (including password_hash) for credential checks only.
async function findByEmailWithPassword(email) {
  const { rows } = await query(
    'SELECT id, full_name, email, password_hash FROM users WHERE email = $1',
    [email.trim().toLowerCase()]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const { rows } = await query('SELECT id, full_name, email FROM users WHERE email = $1', [
    email.trim().toLowerCase(),
  ]);
  return rows[0] || null;
}

async function setPassword(userId, password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [passwordHash, userId]);
}

async function emailExists(email) {
  const { rowCount } = await query('SELECT 1 FROM users WHERE email = $1', [email.trim().toLowerCase()]);
  return rowCount > 0;
}

async function create({ fullName, email, password, googleId }) {
  const passwordHash = password ? await bcrypt.hash(password, SALT_ROUNDS) : null;
  const { rows } = await query(
    `INSERT INTO users (full_name, email, password_hash, google_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name, email`,
    [fullName.trim(), email.trim().toLowerCase(), passwordHash, googleId || null]
  );
  return toPublic(rows[0]);
}

async function verifyPassword(row, plainText) {
  if (!row?.password_hash) return false; // Google-only account
  return bcrypt.compare(plainText, row.password_hash);
}

// Find by Google ID, or by (Google-verified) email so an existing password account gets linked.
async function findOrCreateGoogleUser({ googleId, email, fullName }) {
  const normalizedEmail = email.trim().toLowerCase();
  const { rows } = await query(
    `SELECT id, full_name, email, google_id FROM users
     WHERE google_id = $1 OR email = $2
     ORDER BY (google_id = $1) DESC NULLS LAST
     LIMIT 1`,
    [googleId, normalizedEmail]
  );

  const existing = rows[0];
  if (!existing) return create({ fullName: fullName || normalizedEmail, email: normalizedEmail, googleId });
  if (existing.google_id === googleId) return toPublic(existing);

  if (existing.google_id) {
    const err = new Error('This email is already linked to a different Google account.');
    err.statusCode = 409;
    throw err;
  }

  // Registration never verifies email ownership, so whoever set this account's password
  // may not own the address. Google just proved the caller does: link the account and
  // drop the unverified password so only the verified owner can sign in.
  await query(
    'UPDATE users SET google_id = $1, password_hash = NULL, updated_at = now() WHERE id = $2',
    [googleId, existing.id]
  );
  return toPublic(existing);
}

module.exports = {
  UUID_RE,
  toPublic,
  findById,
  findByEmailWithPassword,
  findByEmail,
  setPassword,
  emailExists,
  create,
  verifyPassword,
  findOrCreateGoogleUser,
};
