import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: 'ahmed@mindmuse.co'
      }
    });

    console.log('User found:', user);
  } catch (error) {
    console.error('Error finding user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
