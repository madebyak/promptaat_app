import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const password = 'admin123'; // This is just for testing

  try {
    // Check if admin user exists
    const existingAdmin = await prisma.adminUser.findFirst({
      where: { username },
    });

    if (!existingAdmin) {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const admin = await prisma.adminUser.create({
        data: {
          username,
          password: hashedPassword,
        },
      });

      console.log('Created test admin user:', admin.username);
      console.log('Test credentials:');
      console.log('Username:', username);
      console.log('Password:', password);
    } else {
      console.log('Test admin user already exists');
      console.log('Test credentials:');
      console.log('Username:', username);
      console.log('Password:', password);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
