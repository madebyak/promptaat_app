const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Try to query the database
    const result = await prisma.$queryRaw`SELECT 1`
    console.log('Database connection successful!')
  } catch (error) {
    console.error('Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
