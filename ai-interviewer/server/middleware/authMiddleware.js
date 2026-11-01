const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/user');

async function protect(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authenticated. Please log in.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session. Please log in again.' });
  }

  try {
    req.user = await User.findById(decoded.id);
  } catch (err) {
    // A database outage is a server error, not a reason to log the user out
    return next(err);
  }

  if (!req.user) {
    return res.status(401).json({ success: false, error: 'User no longer exists.' });
  }

  next();
}

module.exports = { protect };
