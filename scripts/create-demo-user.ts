const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const userData = {
    firstName: 'Ahmed',
    lastName: 'Kamal',
    email: 'ahmed@mindmuse.co',
    password: 'admin@123',
    country: 'Iraq',
    emailVerified: true
  };

  try {
    // Delete existing user if exists
    await prisma.user.deleteMany({
      where: { email: userData.email },
    });

    // Create new user with fresh password hash
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        country: userData.country,
        emailVerified: userData.emailVerified
      },
    });

    console.log('Demo user created successfully:', {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      country: user.country
    });
  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
