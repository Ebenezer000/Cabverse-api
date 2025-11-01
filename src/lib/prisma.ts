import { PrismaClient } from '@prisma/client';
import { checkDatabaseHealth, logDatabaseHealth } from './dbHealth';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Perform database health check on startup
async function initializeDatabaseHealthCheck() {
  try {
    const healthStatus = await checkDatabaseHealth(prisma);
    logDatabaseHealth(healthStatus);
    
    if (healthStatus.status === 'unhealthy') {
      console.warn('⚠️  Database health check failed on startup. The application may not function correctly.');
    }
  } catch (error) {
    console.error('❌ Failed to perform database health check:', error);
  }
}

// Run health check when this module is imported
initializeDatabaseHealthCheck();
