import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const adminUsers = [
      { username: 'ranya', password: 'Tothemoon24$' },
      { username: 'ahmed', password: 'Tothemoon24$' },
    ];

    const results = [];

    for (const user of adminUsers) {
      // Check if admin user already exists
      const existingAdmin = await prisma.adminUser.findFirst({
        where: { username: user.username },
      });

      if (existingAdmin) {
        results.push({ username: user.username, status: 'already exists' });
        continue;
      }

      // Create admin user
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const admin = await prisma.adminUser.create({
        data: {
          username: user.username,
          password: hashedPassword,
        },
      });

      results.push({ username: admin.username, status: 'created successfully' });
    }

    return NextResponse.json({
      message: 'Admin users setup completed',
      results,
    });
  } catch (error) {
    console.error('Error seeding admin users:', error);
    return NextResponse.json(
      { error: 'Failed to seed admin users' },
      { status: 500 }
    );
  }
}
