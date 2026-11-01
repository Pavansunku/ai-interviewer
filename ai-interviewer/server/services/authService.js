const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_MAX_AGE } = require('../config');

function generateToken(res, userId) {
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.cookie('token', token, {
    httpOnly: true,       // not accessible via document.cookie — blocks XSS token theft
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict',   // blocks CSRF
    maxAge: COOKIE_MAX_AGE,
  });
}

function clearToken(res) {
  res.cookie('token', '', { httpOnly: true, maxAge: 0 });
}

module.exports = { generateToken, clearToken };
