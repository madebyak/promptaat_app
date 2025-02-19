const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const password = 'admin123'; // Change this to a secure password

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const admin = await prisma.adminUser.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    console.log('Admin user created successfully:', admin.username);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
