import { sendEmail, generateVerificationEmailHtml, generatePasswordResetEmailHtml } from './ses';

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
export async function sendVerificationEmail(
  email: string,
  firstName: string,
  otp: string
) {
  return sendEmail({
    to: email,
    subject: 'Verify your Promptaat account',
    html: generateVerificationEmailHtml(firstName, otp),
  });
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  otp: string
) {
  return sendEmail({
    to: email,
    subject: 'Reset your Promptaat password',
    html: generatePasswordResetEmailHtml(firstName, otp),
  });
}
