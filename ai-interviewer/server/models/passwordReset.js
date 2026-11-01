const crypto = require('crypto');
const { query } = require('../utils/db');

const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');

// True when this user already asked for a link in the last `seconds` (simple abuse throttle).
async function hasRecent(userId, seconds = 60) {
  const { rowCount } = await query(
    `SELECT 1 FROM password_resets
     WHERE user_id = $1 AND created_at > now() - ($2 || ' seconds')::interval`,
    [userId, String(seconds)]
  );
  return rowCount > 0;
}

// Replaces any earlier links for the user and returns the new raw token (never stored).
async function create(userId, ttlMinutes) {
  const token = crypto.randomBytes(32).toString('hex');
  await query('DELETE FROM password_resets WHERE user_id = $1', [userId]);
  await query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + ($3 || ' minutes')::interval)`,
    [userId, hash(token), String(ttlMinutes)]
  );
  return token;
}

// Atomically marks a valid, unused, unexpired token as used. Returns the user id or null.
async function consume(token) {
  const { rows } = await query(
    `UPDATE password_resets SET used_at = now()
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
     RETURNING user_id`,
    [hash(token)]
  );
  return rows[0]?.user_id || null;
}

async function clearForUser(userId) {
  await query('DELETE FROM password_resets WHERE user_id = $1', [userId]);
}

module.exports = { hasRecent, create, consume, clearForUser };
