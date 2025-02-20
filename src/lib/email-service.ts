import { Resend } from 'resend';
import { prisma } from './prisma';
import {
  getVerificationEmailTemplate,
  getWelcomeEmailTemplate,
  getPasswordResetEmailTemplate,
  getPromptSharingEmailTemplate,
} from './email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'onboarding@resend.dev'; // Using Resend's default sending domain for testing
const MAX_EMAILS_PER_DAY = 5; // Per user

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function logEmail(userId: number, type: string, recipient: string, status: string) {
  try {
    await prisma.emailLog.create({
      data: {
        userId,
        type,
        recipient,
        status,
      },
    });
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}

async function checkEmailLimit(userId: number): Promise<boolean> {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const count = await prisma.emailLog.count({
    where: {
      userId,
      createdAt: {
        gte: oneDayAgo,
      },
    },
  });

  return count < MAX_EMAILS_PER_DAY;
}

async function sendEmail(options: EmailOptions, userId: number, type: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      throw new Error('Email service is not configured');
    }

    // Log email details in development
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 Development Mode - Email Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Type:', type);
      console.log('HTML Content:', options.html);
      console.log('Text Content:', options.text);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    // Always try to send the email, even in development
    console.log('Attempting to send email via Resend...');
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      ...options,
    });

    if (response.error) {
      console.error('Failed to send email:', {
        error: response.error,
        to: options.to,
        subject: options.subject,
        type,
      });
      await logEmail(userId, type, options.to, 'failed');
      throw new Error(`Failed to send email: ${response.error.message}`);
    }

    console.log('Email sent successfully:', {
      to: options.to,
      subject: options.subject,
      type,
      id: response.id,
    });

    await logEmail(userId, type, options.to, 'sent');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    await logEmail(userId, type, options.to, 'failed');
    throw error;
  }
}

export async function sendVerificationEmail(userId: number, email: string, name: string, otp: string) {
  if (!await checkEmailLimit(userId)) {
    throw new Error('Daily email limit exceeded');
  }

  const { html, text } = getVerificationEmailTemplate({ name, otp });
  
  return sendEmail(
    {
      to: email,
      subject: 'Verify your email address',
      html,
      text,
    },
    userId,
    'verification'
  );
}

export async function sendWelcomeEmail(userId: number, email: string, name: string) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`;
  const { html, text } = getWelcomeEmailTemplate({ name, loginUrl });
  
  return sendEmail(
    {
      to: email,
      subject: 'Welcome to Promptaat!',
      html,
      text,
    },
    userId,
    'welcome'
  );
}

export async function sendPasswordResetEmail(userId: number, email: string, name: string, token: string) {
  if (!await checkEmailLimit(userId)) {
    throw new Error('Daily email limit exceeded');
  }

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
  const { html, text } = getPasswordResetEmailTemplate({ name, resetLink });
  
  return sendEmail(
    {
      to: email,
      subject: 'Reset your password',
      html,
      text,
    },
    userId,
    'reset_password'
  );
}

export async function sendPromptSharingEmail(
  userId: number,
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  promptTitle: string,
  promptId: string
) {
  if (!await checkEmailLimit(userId)) {
    throw new Error('Daily email limit exceeded');
  }

  const promptLink = `${process.env.NEXT_PUBLIC_APP_URL}/prompts/${promptId}`;
  const { html, text } = getPromptSharingEmailTemplate({
    name: recipientName,
    promptTitle,
    promptLink,
    senderName,
  });
  
  return sendEmail(
    {
      to: recipientEmail,
      subject: `${senderName} shared a prompt with you`,
      html,
      text,
    },
    userId,
    'prompt_sharing'
  );
}
