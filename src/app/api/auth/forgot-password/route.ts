import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPasswordResetAttempts, recordPasswordResetAttempt } from '@/lib/rate-limit';
import { sendPasswordResetEmail } from '@/lib/email-service';
import { hash } from 'bcryptjs';
import crypto from 'crypto';

async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('reCAPTCHA verification failed:', error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { email, recaptchaToken } = await req.json();

    if (!email || !recaptchaToken) {
      return NextResponse.json(
        { error: 'Email and reCAPTCHA token are required' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA
    const isRecaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const canRequestReset = await checkPasswordResetAttempts(email);
    if (!canRequestReset) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists or not
    if (!user) {
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive password reset instructions.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await hash(resetToken, 12);

    // Store reset token
    await prisma.passwordResetRequest.create({
      data: {
        email: user.email,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        userId: user.id,
      },
    });

    // Record the attempt
    await recordPasswordResetAttempt(email);

    // Send email
    await sendPasswordResetEmail(
      user.id,
      user.email,
      `${user.firstName} ${user.lastName}`,
      resetToken
    );

    return NextResponse.json(
      { message: 'If an account exists with this email, you will receive password reset instructions.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
