import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(30, 'First name must not be longer than 30 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(30, 'Last name must not be longer than 30 characters'),
  email: z.string().email('Invalid email address'),
});

export async function PATCH(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const { firstName, lastName, email } = profileSchema.parse(body);

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: parseInt(session.user.id),
        },
      },
    });

    if (existingUser) {
      return new NextResponse('Email already taken', { status: 400 });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(session.user.id),
      },
      data: {
        firstName,
        lastName,
        email,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    console.error('Error updating profile:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
