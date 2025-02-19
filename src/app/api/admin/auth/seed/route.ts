import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findFirst({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin user already exists' });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.adminUser.create({
      data: {
        username: 'admin',
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: 'Admin user created successfully',
      username: admin.username,
    });
  } catch (error) {
    console.error('Error seeding admin user:', error);
    return NextResponse.json(
      { error: 'Failed to seed admin user' },
      { status: 500 }
    );
  }
}
