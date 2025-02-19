import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/email-service';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        verificationCode: true,
        verificationCodeExpires: true,
        emailVerified: true,
        emailVerificationAttempts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      return NextResponse.json(
        { error: 'No verification code found' },
        { status: 400 }
      );
    }

    if (user.verificationCodeExpires < new Date()) {
      return NextResponse.json(
        { error: 'Verification code expired' },
        { status: 400 }
      );
    }

    if (user.verificationCode !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Verify the user's email and reset verification data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
        emailVerificationAttempts: 0,
        lastEmailSentAt: null,
      },
    });

    // Send welcome email
    await sendWelcomeEmail(user.id, email, user.firstName);

    return NextResponse.json({ 
      message: 'Email verified successfully',
      redirectTo: '/auth/login?verified=true'
    });
  } catch (error: any) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        emailVerified: true,
        emailVerificationAttempts: true,
        lastEmailSentAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Check rate limiting
    if (user.lastEmailSentAt) {
      const timeSinceLastEmail = Date.now() - user.lastEmailSentAt.getTime();
      const waitTimeMinutes = 5;
      if (timeSinceLastEmail < waitTimeMinutes * 60 * 1000) {
        const waitTimeRemaining = Math.ceil((waitTimeMinutes * 60 * 1000 - timeSinceLastEmail) / 1000 / 60);
        return NextResponse.json(
          { error: `Please wait ${waitTimeRemaining} minutes before requesting another code` },
          { status: 400 }
        );
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        verificationCode: otp,
        verificationCodeExpires,
        emailVerificationAttempts: {
          increment: 1
        },
        lastEmailSentAt: new Date()
      }
    });

    // Send new verification email
    await sendVerificationEmail(updatedUser.id, email, updatedUser.firstName, otp);

    return NextResponse.json({ 
      message: 'New verification code sent successfully' 
    });
  } catch (error: any) {
    console.error('Error resending verification code:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
