interface BaseEmailData {
  name: string;
}

interface VerificationEmailData extends BaseEmailData {
  otp: string;
}

interface WelcomeEmailData extends BaseEmailData {
  loginUrl: string;
}

interface PasswordResetData extends BaseEmailData {
  resetLink: string;
}

interface PromptSharingData extends BaseEmailData {
  promptTitle: string;
  promptLink: string;
  senderName: string;
}

// Common components for all emails
const getEmailWrapper = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Promptaat</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
      color: #18181b;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    .card {
      background: white;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .logo {
      margin-bottom: 24px;
      text-align: center;
    }
    
    .logo img {
      height: 40px;
      width: auto;
    }
    
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 24px;
      text-align: center;
    }
    
    p {
      font-size: 16px;
      line-height: 24px;
      margin: 16px 0;
    }
    
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #6366f1;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 16px 0;
      text-align: center;
    }
    
    .otp {
      font-family: monospace;
      font-size: 32px;
      font-weight: 600;
      letter-spacing: 4px;
      text-align: center;
      margin: 32px 0;
      color: #6366f1;
    }
    
    .footer {
      text-align: center;
      font-size: 14px;
      color: #71717a;
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid #e4e4e7;
    }

    .footer a {
      color: #6366f1;
      text-decoration: none;
    }

    .disclaimer {
      font-size: 12px;
      color: #a1a1aa;
      margin-top: 16px;
      text-align: center;
    }
    
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #18181b;
        color: #f4f4f5;
      }
      
      .card {
        background: #27272a;
      }
      
      .footer {
        border-top-color: #3f3f46;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <img src="${process.env.NEXT_PUBLIC_APP_URL}/Promptaat_logo_${process.env.NODE_ENV === 'development' ? 'white' : 'black'}.svg" alt="Promptaat" />
      </div>
      ${content}
      <div class="footer">
        <p>Need help? Contact us at <a href="mailto:support@promptaat.com">support@promptaat.com</a></p>
        <p>Visit our website: <a href="https://www.promptaat.com">www.promptaat.com</a></p>
      </div>
      <div class="disclaimer">
        This email was sent by Promptaat. Please do not reply to this email.
        The information contained in this email is confidential and may be legally privileged.
        If you are not the intended recipient, please delete this email and notify us immediately.
      </div>
    </div>
  </div>
</body>
</html>
`;

// Email templates
export function getVerificationEmailTemplate({ name, otp }: VerificationEmailData) {
  const text = `
Hi ${name},

Welcome to Promptaat! Please verify your email address by entering this code:

${otp}

This code will expire in 30 minutes.

If you didn't create an account with Promptaat, please ignore this email.

Best regards,
The Promptaat Team
`;

  const html = getEmailWrapper(`
    <h1>Verify your email address</h1>
    <p>Hi ${name},</p>
    <p>Welcome to Promptaat! Please use the following code to verify your email address:</p>
    <div class="otp">${otp}</div>
    <p>This code will expire in 30 minutes. If you didn't create an account with Promptaat, please ignore this email.</p>
  `);

  return { html, text };
}

export function getWelcomeEmailTemplate({ name, loginUrl }: WelcomeEmailData) {
  const text = `
Welcome to Promptaat, ${name}!

Your email has been verified and your account is now ready to use.

Get started by logging in here: ${loginUrl}

Best regards,
The Promptaat Team
`;

  const html = getEmailWrapper(`
    <h1>Welcome to Promptaat!</h1>
    <p>Hi ${name},</p>
    <p>Your email has been verified and your account is now ready to use.</p>
    <p style="text-align: center;">
      <a href="${loginUrl}" class="button">Get Started</a>
    </p>
    <p>We're excited to have you on board!</p>
  `);

  return { html, text };
}

export function getPasswordResetEmailTemplate({ name, resetLink }: PasswordResetData) {
  const text = `
Hi ${name},

We received a request to reset your password. Click the link below to choose a new password:

${resetLink}

This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.

Best regards,
The Promptaat Team
`;

  const html = getEmailWrapper(`
    <h1>Reset Your Password</h1>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to choose a new password:</p>
    <p style="text-align: center;">
      <a href="${resetLink}" class="button">Reset Password</a>
    </p>
    <p>This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
  `);

  return { html, text };
}

export function getPromptSharingEmailTemplate({ name, promptTitle, promptLink, senderName }: PromptSharingData) {
  const text = `
Hi ${name},

${senderName} has shared a prompt with you on Promptaat:

"${promptTitle}"

View the prompt here: ${promptLink}

Best regards,
The Promptaat Team
`;

  const html = getEmailWrapper(`
    <h1>Shared Prompt</h1>
    <p>Hi ${name},</p>
    <p>${senderName} has shared a prompt with you on Promptaat:</p>
    <p style="text-align: center; font-size: 20px; font-weight: 600; margin: 24px 0;">
      "${promptTitle}"
    </p>
    <p style="text-align: center;">
      <a href="${promptLink}" class="button">View Prompt</a>
    </p>
  `);

  return { html, text };
}
