import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email-service';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, country } = await req.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    try {
      // Generate OTP
      const otp = generateOTP();
      const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // Create user
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          country,
          verificationCode: otp,
          verificationCodeExpires,
          emailVerificationAttempts: 1,
          lastEmailSentAt: new Date(),
        },
      });

      // Send verification email
      await sendVerificationEmail(user.id, user.email, user.firstName, otp);

      return NextResponse.json({
        message: 'User created successfully',
        email: user.email,
      });
    } catch (dbError: any) {
      // If user creation fails, return appropriate error
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
