import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email-service';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    console.log('Starting signup process...');
    const { firstName, lastName, email, password, country } = await req.json();
    console.log('Received signup data for:', email);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      console.log('User already exists:', email);
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
      console.log('Generated OTP:', otp);
      const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      console.log('Creating user in database...');
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
      console.log('User created successfully:', user.id);

      // Send verification email
      console.log('Attempting to send verification email...');
      try {
        await sendVerificationEmail(user.id, user.email, user.firstName, otp);
        console.log('Verification email sent successfully');
      } catch (emailError: any) {
        console.error('Failed to send verification email:', {
          error: emailError.message,
          stack: emailError.stack,
          userId: user.id,
          email: user.email
        });
        
        // Even if email fails, we return success since the user was created
        return NextResponse.json({
          message: 'User created but email sending failed. Please try requesting a new verification code.',
          email: user.email,
          emailError: emailError.message
        });
      }

      return NextResponse.json({
        message: 'User created successfully',
        email: user.email,
      });
    } catch (dbError: any) {
      console.error('Database error:', {
        error: dbError.message,
        stack: dbError.stack,
        code: dbError.code
      });
      
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
    console.error('Error in signup:', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
