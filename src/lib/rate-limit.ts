import { prisma } from './prisma';

const MAX_LOGIN_ATTEMPTS = 6;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export async function checkLoginAttempts(identifier: string): Promise<boolean> {
  const now = new Date();
  const fifteenMinutesAgo = new Date(now.getTime() - LOCKOUT_DURATION);

  // Clean up old attempts
  await prisma.loginAttempt.deleteMany({
    where: {
      createdAt: {
        lt: fifteenMinutesAgo,
      },
    },
  });

  // Count recent attempts
  const attempts = await prisma.loginAttempt.count({
    where: {
      identifier,
      createdAt: {
        gte: fifteenMinutesAgo,
      },
    },
  });

  return attempts < MAX_LOGIN_ATTEMPTS;
}

export async function recordLoginAttempt(identifier: string, success: boolean) {
  await prisma.loginAttempt.create({
    data: {
      identifier,
      success,
    },
  });
}

export async function resetLoginAttempts(identifier: string) {
  await prisma.loginAttempt.deleteMany({
    where: {
      identifier,
      success: false,
    },
  });
}

export async function checkPasswordResetAttempts(email: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attempts = await prisma.passwordResetRequest.count({
    where: {
      email,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  return attempts < 3; // Maximum 3 password reset requests per day
}

export async function recordPasswordResetAttempt(email: string) {
  await prisma.passwordResetRequest.create({
    data: {
      email,
    },
  });
}
