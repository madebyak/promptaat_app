import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';

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
    const { token, password, recaptchaToken } = await req.json();

    if (!token || !password || !recaptchaToken) {
      return NextResponse.json(
        { error: 'Token, password, and reCAPTCHA token are required' },
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

    // Find reset request
    const resetRequest = await prisma.passwordResetRequest.findFirst({
      where: {
        token: await hash(token, 12),
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetRequest) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Update user's password
    const hashedPassword = await hash(password, 12);
    await prisma.user.update({
      where: {
        id: resetRequest.userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Mark reset request as used
    await prisma.passwordResetRequest.update({
      where: {
        id: resetRequest.id,
      },
      data: {
        used: true,
      },
    });

    // Send notification email
    if (resetRequest.user) {
      // You can implement a function to send a notification email here
      // await sendPasswordChangeNotificationEmail(resetRequest.user.id, resetRequest.user.email);
    }

    return NextResponse.json(
      { message: 'Password reset successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
