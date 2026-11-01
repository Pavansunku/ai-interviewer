const User = require('../models/user');
const { generateToken, clearToken } = require('../services/authService');
const { OAuth2Client } = require('google-auth-library');
const PasswordReset = require('../models/passwordReset');
const { sendPasswordReset } = require('../services/mailService');
const { GOOGLE_CLIENT_ID, FRONTEND_URL, PASSWORD_RESET_TTL_MIN } = require('../config');

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, error: 'Full name, email, and password are required.' });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    if (await User.emailExists(email)) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }

    const user = await User.create({ fullName, email, password });

    generateToken(res, user._id);

    res.status(201).json({ success: true, data: { user } });
  } catch (err) {
    // Two concurrent registrations can both pass emailExists(); the unique index catches it
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: 'An account with this email already exists.' });
    }
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const row = await User.findByEmailWithPassword(email);

    if (!row || !(await User.verifyPassword(row, password))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    generateToken(res, row.id);

    res.json({ success: true, data: { user: User.toPublic(row) } });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  clearToken(res);
  res.json({ success: true, message: 'Logged out successfully.' });
}

async function getMe(req, res) {
  res.json({
    success: true,
    data: { user: req.user },
  });
}

async function googleAuth(req, res, next) {
  try {
    // Without a client ID, verifyIdToken skips the audience check and would accept
    // tokens minted for any Google app.
    if (!GOOGLE_CLIENT_ID) {
      return res.status(503).json({ success: false, error: 'Google sign-in is not configured on this server.' });
    }

    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, error: 'Google credential is required' });
    }

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, email_verified: emailVerified, name: fullName } = ticket.getPayload();

    // Accounts are linked by email, so only trust addresses Google has verified
    if (!email || !emailVerified) {
      return res.status(401).json({ success: false, error: 'Your Google account email is not verified.' });
    }

    const user = await User.findOrCreateGoogleUser({ googleId, email, fullName });

    // Issue standard JWT cookie
    generateToken(res, user._id);

    res.json({ success: true, data: { user } });
  } catch (err) {
    console.error('Google Auth Error:', err.message);
    next(err);
  }
}

// Always answers the same way so the endpoint can't be used to find out which emails have accounts.
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    const user = await User.findByEmail(email);

    // These hints go to the server console only; the browser always gets the same answer
    if (!user) {
      console.log(`[mail] Reset requested for ${email.trim()}, but no account uses that email. Nothing sent.`);
    } else if (await PasswordReset.hasRecent(user.id)) {
      console.log(`[mail] A reset link was already created for ${user.email} less than a minute ago. Wait 60 seconds and try again.`);
    }

    if (user && !(await PasswordReset.hasRecent(user.id))) {
      const token = await PasswordReset.create(user.id, PASSWORD_RESET_TTL_MIN);
      const base = (FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
      const link = `${base}/reset-password?token=${token}`;

      // Not awaited: the response time must not reveal whether the account exists
      sendPasswordReset({ to: user.email, name: user.full_name, link, ttlMinutes: PASSWORD_RESET_TTL_MIN })
        .then(() => console.log(`[mail] Reset email sent to ${user.email}`))
        .catch((err) => console.error('[mail] Failed to send reset email:', err.message));
    }

    res.json({ success: true, message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    if (typeof token !== 'string' || !token || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Reset token and new password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const userId = await PasswordReset.consume(token);
    if (!userId) {
      return res.status(400).json({ success: false, error: 'This reset link is invalid or has expired.' });
    }

    await User.setPassword(userId, password);
    await PasswordReset.clearForUser(userId);
    clearToken(res); // end any session on this browser; the user signs in with the new password

    res.json({ success: true, message: 'Password updated. You can now sign in.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, getMe, googleAuth, forgotPassword, resetPassword };
