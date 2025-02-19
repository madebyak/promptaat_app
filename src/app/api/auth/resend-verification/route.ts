import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOTP, sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        emailVerified: true,
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

    // Generate new OTP
    const verificationCode = generateOTP();
    const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Update user with new verification code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpires,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, user.firstName, verificationCode);

    return NextResponse.json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Error resending verification code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
