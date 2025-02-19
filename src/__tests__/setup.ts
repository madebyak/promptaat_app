import { beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { EmailService } from './mocks/email-service';

// Mock the email service
vi.mock('@/lib/email-service', () => {
  return {
    EmailService,
  };
});

beforeAll(async () => {
  // Ensure the database is in a known state
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});
