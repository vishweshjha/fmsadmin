import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { seedAdminUsers } from './admin-user.seed';

config();

const prisma = new PrismaClient();

async function runSeed() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Database connected');

    await seedAdminUsers(prisma);

    console.log('Seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSeed();
