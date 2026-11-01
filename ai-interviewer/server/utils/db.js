const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { DATABASE_URL, DATABASE_SSL, DATABASE_SSL_CA } = require('../config');

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

// Supabase signs its database and pooler certificates with its own root CA
// (not in Node's trust store). Bundled from Supabase's published prod-ca-2021.crt.
const SUPABASE_CA_PATH = path.join(__dirname, '..', 'db', 'supabase-root-2021-ca.crt');
const isSupabaseHost = (host) => /\.supabase\.(com|co)$/i.test(host);

// TLS is decided here rather than by ?sslmode= in the URL, so the certificate is
// always verified against the right CA:
//   DATABASE_SSL unset     → TLS for remote hosts, none for localhost
//   DATABASE_SSL=false     → no TLS
//   DATABASE_SSL=no-verify → TLS without certificate verification (last resort)
//   DATABASE_SSL_CA=<path> → verify against this PEM instead of the default CA
function sslConfig(hostname) {
  const mode = (DATABASE_SSL || '').toLowerCase();
  if (mode === 'false' || (!mode && LOCAL_HOSTS.has(hostname))) return false;
  if (mode === 'no-verify') return { rejectUnauthorized: false };

  const caPath = DATABASE_SSL_CA || (isSupabaseHost(hostname) ? SUPABASE_CA_PATH : null);
  return caPath ? { rejectUnauthorized: true, ca: fs.readFileSync(caPath, 'utf8') } : { rejectUnauthorized: true };
}

function buildPoolConfig(connectionString) {
  const url = new URL(connectionString);
  for (const param of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) url.searchParams.delete(param);

  return {
    connectionString: url.toString(),
    ssl: sslConfig(url.hostname),
    max: 5,
    idleTimeoutMillis: 30000,
  };
}

const pool = DATABASE_URL ? new Pool(buildPoolConfig(DATABASE_URL)) : null;

// An idle client can be dropped by the server (e.g. the Supabase pooler); without
// this listener the 'error' event would crash the process.
pool?.on('error', (err) => console.error('[DB] Idle client error:', err.message));

function query(text, params) {
  return pool.query(text, params);
}

async function connectDB() {
  try {
    if (!pool) throw new Error('DATABASE_URL is not set.');
    const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
    await pool.query(schema);
    const { rows } = await pool.query('SELECT current_database() AS db, inet_server_addr() AS host');
    console.log(`✅ Postgres connected: ${rows[0].db}@${rows[0].host || 'local'}`);
  } catch (err) {
    console.error('❌ Postgres connection failed:', err.message);
    console.error('   → Set DATABASE_URL in server/.env to a Postgres connection string.');
    console.error('   → Supabase: Dashboard → Connect → Session pooler (IPv4) URI.');
    process.exit(1);
  }
}

module.exports = connectDB;
module.exports.query = query;
module.exports.pool = pool;
