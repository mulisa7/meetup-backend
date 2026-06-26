const express = require('express');
const cors = require('cors');
const mailgun = require('mailgun-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ===== MAILGUN CONFIG =====
const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

// ===== SEND VERIFICATION EMAIL =====
app.post('/send-verification', async (req, res) => {
  const { email, displayName } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Build verification link (you can customize this)
  const verificationLink = `https://meetup-1248a.web.app/verify?email=${encodeURIComponent(email)}`;

  const data = {
    from: `Meetup <noreply@${process.env.MAILGUN_DOMAIN}>`,
    to: email,
    subject: 'Verify your Meetup account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
          .logo { background: #00C896; color: #fff; width: 40px; height: 40px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; margin-bottom: 16px; }
          h1 { color: #1a1a2e; margin-bottom: 8px; }
          p { color: #475569; line-height: 1.6; }
          .btn { display: inline-block; padding: 12px 24px; background: #00C896; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
          .footer { margin-top: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">MU</div>
          <h1>Welcome to Meetup${displayName ? ', ' + displayName : ''}!</h1>
          <p>Thanks for signing up. Please click the button below to verify your email address and activate your account.</p>
          <a href="${verificationLink}" class="btn">Verify Email</a>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <div class="footer">
            <p>— The Meetup Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const result = await mg.messages().send(data);
    console.log('✅ Email sent:', result);
    res.json({ success: true, messageId: result.id });
  } catch (error) {
    console.error('❌ Mailgun error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== HEALTH CHECK =====
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Meetup backend running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});