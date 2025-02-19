import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { POST as signupHandler } from '@/app/api/auth/signup/route';
import { POST as verifyHandler, PUT as resendHandler } from '@/app/api/auth/verify-email/route';
import { NextRequest } from 'next/server';
import { EmailService } from './mocks/email-service';

describe('Authentication Flow', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'User',
    country: 'US',
  };

  beforeEach(async () => {
    // Clean up test data and reset mocks
    await prisma.user.deleteMany({
      where: { 
        OR: [
          { email: testUser.email },
          { email: 'ratelimit@example.com' }
        ]
      },
    });
    EmailService.reset();
  });

  it('should handle the complete signup and verification flow', async () => {
    // 1. Test user signup
    const signupReq = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(testUser),
    });

    const signupRes = await signupHandler(signupReq);
    expect(signupRes.status).toBe(200);
    const signupData = await signupRes.json();
    expect(signupData.email).toBe(testUser.email);

    // 2. Verify user was created with correct fields
    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        verificationCode: true,
        verificationCodeExpires: true,
        emailVerificationAttempts: true,
      },
    });

    expect(user).toBeTruthy();
    expect(user?.emailVerified).toBe(false);
    expect(user?.verificationCode).toHaveLength(6);
    expect(user?.emailVerificationAttempts).toBe(1);
    expect(user?.verificationCodeExpires).toBeInstanceOf(Date);

    // Verify email was "sent"
    expect(EmailService.getLastEmailSentAt(testUser.email)).toBeTruthy();

    // 3. Test invalid verification code
    const invalidVerifyReq = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        code: '000000',
      }),
    });

    const invalidVerifyRes = await verifyHandler(invalidVerifyReq);
    expect(invalidVerifyRes.status).toBe(400);

    // 4. Test valid verification code
    const validVerifyReq = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({
        email: testUser.email,
        code: user?.verificationCode,
      }),
    });

    const validVerifyRes = await verifyHandler(validVerifyReq);
    expect(validVerifyRes.status).toBe(200);

    // 5. Verify user is now verified
    const verifiedUser = await prisma.user.findUnique({
      where: { email: testUser.email },
      select: {
        emailVerified: true,
        verificationCode: true,
        emailVerificationAttempts: true,
      },
    });

    expect(verifiedUser?.emailVerified).toBe(true);
    expect(verifiedUser?.verificationCode).toBeNull();
  });

  it('should handle rate limiting for verification emails', async () => {
    // Create a test user with lastEmailSentAt
    const lastEmailTime = new Date();
    const user = await prisma.user.create({
      data: {
        ...testUser,
        email: 'ratelimit@example.com',
        password: await hash(testUser.password, 12),
        verificationCode: '123456',
        verificationCodeExpires: new Date(Date.now() + 30 * 60 * 1000),
        lastEmailSentAt: lastEmailTime,
      },
    });

    // Set mock email service state
    EmailService.lastEmailSentAt[user.email] = lastEmailTime;

    // Attempt to resend verification email immediately
    const resendReq = new NextRequest('http://localhost:3000/api/auth/verify-email', {
      method: 'PUT',
      body: JSON.stringify({
        email: user.email,
      }),
    });

    const resendRes = await resendHandler(resendReq);
    expect(resendRes.status).toBe(400);
    const resendData = await resendRes.json();
    expect(resendData.error).toContain('Please wait');

    // Verify no new email was sent
    expect(EmailService.getLastEmailSentAt(user.email)).toEqual(lastEmailTime);

    // Verify database wasn't updated
    const updatedUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { lastEmailSentAt: true },
    });
    expect(updatedUser?.lastEmailSentAt).toEqual(lastEmailTime);
  });
});
