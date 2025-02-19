import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password, rememberMe } = loginSchema.parse(body);

    // Find user
    const user = await prisma.adminUser.findFirst({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: rememberMe ? '7d' : '24h' }
    );

    // Set cookie
    cookies().set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: rememberMe
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Return user data (excluding password)
    const { password: _, ...userData } = user;
    return NextResponse.json({
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
