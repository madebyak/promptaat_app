import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Hash the password
    const hashedPassword = await hash('admin123', 12);

    // Create the user
    const user = await prisma.user.create({
      data: {
        firstName: 'Ahmed',
        lastName: 'Kamal',
        email: 'ahmed@mindmuse.co',
        password: hashedPassword,
        country: 'Iraq',
        emailVerified: true, // Set as verified
      },
    });

    console.log('Test user created successfully:', user);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
