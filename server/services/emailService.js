async function sendWithResend({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error('Resend is not configured. Set RESEND_API_KEY and EMAIL_FROM.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend send failed (${response.status}): ${body}`);
  }
}

async function sendWithSendGrid({ to, subject, html, text }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error('SendGrid is not configured. Set SENDGRID_API_KEY and EMAIL_FROM.');
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }]
        }
      ],
      from: { email: from },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html }
      ]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`SendGrid send failed (${response.status}): ${body}`);
  }
}

async function sendResetPasswordEmail({ to, resetUrl }) {
  const provider = String(process.env.EMAIL_PROVIDER || 'none').toLowerCase();
  const subject = 'Reset your INVENZO password';
  const text = `Use this link to reset your password: ${resetUrl}`;
  const html = `<p>Use this link to reset your INVENZO password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 30 minutes.</p>`;

  if (provider === 'resend') {
    await sendWithResend({ to, subject, html, text });
    return { sent: true, provider: 'resend' };
  }

  if (provider === 'sendgrid') {
    await sendWithSendGrid({ to, subject, html, text });
    return { sent: true, provider: 'sendgrid' };
  }

  throw new Error(
    'No supported email provider configured. Set EMAIL_PROVIDER to resend or sendgrid.'
  );
}

module.exports = {
  sendResetPasswordEmail
};

