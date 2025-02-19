const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function dropAllTables() {
  const commands = [
    'DROP TABLE IF EXISTS "_prisma_migrations" CASCADE',
    'DROP TABLE IF EXISTS "saved_prompts" CASCADE',
    'DROP TABLE IF EXISTS "prompt_tools" CASCADE',
    'DROP TABLE IF EXISTS "prompt_categories" CASCADE',
    'DROP TABLE IF EXISTS "prompts" CASCADE',
    'DROP TABLE IF EXISTS "tools" CASCADE',
    'DROP TABLE IF EXISTS "categories" CASCADE',
    'DROP TABLE IF EXISTS "user_catalogs" CASCADE',
    'DROP TABLE IF EXISTS "pro_memberships" CASCADE',
    'DROP TABLE IF EXISTS "password_reset_tokens" CASCADE',
    'DROP TABLE IF EXISTS "users" CASCADE',
    'DROP TABLE IF EXISTS "admin_users" CASCADE',
    'DROP TYPE IF EXISTS "PlanType" CASCADE',
    'DROP TYPE IF EXISTS "PromptType" CASCADE',
    'DROP TYPE IF EXISTS "SubStatus" CASCADE'
  ];

  try {
    for (const command of commands) {
      try {
        await prisma.$executeRawUnsafe(command);
        console.log(`Executed: ${command}`);
      } catch (error) {
        console.error(`Error executing command "${command}":`, error.message);
      }
    }
    console.log('Finished dropping tables and types');
  } finally {
    await prisma.$disconnect();
  }
}

dropAllTables();
