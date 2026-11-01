const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM } = require('../config');

const transporter = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    })
  : null;

// Called once at startup so a wrong SMTP setting shows up immediately in the console
async function verifyMail() {
  if (!transporter) {
    console.log('   Email: not configured (SMTP_HOST missing). Reset links will be printed here instead of emailed.');
    return;
  }
  try {
    await transporter.verify();
    console.log(`   Email: SMTP ready (${SMTP_HOST}:${SMTP_PORT}), sending as ${SMTP_FROM}`);
  } catch (err) {
    console.error(`   Email: SMTP login FAILED (${err.message}). Reset emails will not be delivered.`);
    if (/Invalid login|Username and Password not accepted|535/i.test(err.message)) {
      console.error('   → Gmail needs an App Password (not your normal password). See server/.env.example.');
    }
  }
}

async function sendMail(message) {
  if (!transporter) throw new Error('SMTP is not configured.');
  return transporter.sendMail({ from: SMTP_FROM, ...message });
}

async function sendPasswordReset({ to, name, link, ttlMinutes }) {
  if (!transporter) {
    // No email server configured (typical for local development): show the link here.
    console.log(`[mail] SMTP not configured. Password reset link for ${to}:\n[mail] ${link}`);
    return;
  }

  await sendMail({
    to,
    subject: 'Reset your AI Interviewer password',
    text:
      `Hi ${name},\n\nUse the link below to choose a new password. It expires in ${ttlMinutes} minutes and works once.\n\n` +
      `${link}\n\nIf you didn't ask for this, you can ignore this email.`,
    html:
      `<p>Hi ${String(name).replace(/[<>&]/g, '')},</p>` +
      `<p>Use the button below to choose a new password. The link expires in ${ttlMinutes} minutes and works once.</p>` +
      `<p><a href="${link}">Reset password</a></p>` +
      `<p>If you didn't ask for this, you can ignore this email.</p>`,
  });
}

module.exports = { sendPasswordReset, sendMail, verifyMail, isConfigured: Boolean(transporter) };
