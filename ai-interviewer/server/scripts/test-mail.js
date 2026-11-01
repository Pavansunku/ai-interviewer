// Sends one test email to check your SMTP settings in server/.env.
//
//   npm run test-mail -- you@gmail.com
const { sendMail, isConfigured } = require('../services/mailService');

(async () => {
  const to = process.argv[2];
  if (!to) {
    console.error('Usage: npm run test-mail -- you@example.com');
    process.exit(1);
  }
  if (!isConfigured) {
    console.error('SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in server/.env first.');
    process.exit(1);
  }
  try {
    await sendMail({
      to,
      subject: 'AI Interviewer test email',
      text: 'If you can read this, password reset emails will work.',
    });
    console.log(`✅ Test email sent to ${to}. Check the inbox (and spam).`);
  } catch (err) {
    console.error(`❌ Could not send: ${err.message}`);
    if (/Invalid login|Username and Password not accepted|535/i.test(err.message)) {
      console.error('→ Gmail needs an App Password (not your normal password). See server/.env.example.');
    }
    process.exit(1);
  }
})();
