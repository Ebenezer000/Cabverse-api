import { PrismaClient } from '@prisma/client';
import { checkDatabaseHealth, logDatabaseHealth } from './dbHealth';

// Prisma Client singleton pattern for Next.js
// This ensures we reuse the same PrismaClient instance across requests
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Create Prisma Client with connection pool configuration
const createPrismaClient = () => {
  // Get DATABASE_URL - use connection pooler URL if available (for production)
  // Render and other platforms often provide a separate pooler URL
  const databaseUrl = process.env.DATABASE_URL_POOLER || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

// Use global instance if available (prevents multiple instances in development)
// In production, Next.js may create multiple instances, but we still try to reuse
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Store in global for reuse (works in both dev and production with Next.js)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  // In production, still try to reuse the instance
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prisma;
  }
}

// Handle Prisma disconnection on process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

// Perform database health check on startup (non-blocking)
// Only run health check in production if explicitly enabled
const shouldRunHealthCheck = process.env.ENABLE_STARTUP_HEALTH_CHECK === 'true' || process.env.NODE_ENV === 'development';

async function initializeDatabaseHealthCheck() {
  if (!shouldRunHealthCheck) {
    return;
  }

  try {
    // Run health check asynchronously without blocking
    // Use setTimeout to avoid blocking the module initialization
    setTimeout(async () => {
      try {
        const healthStatus = await checkDatabaseHealth(prisma);
        logDatabaseHealth(healthStatus);
        
        if (healthStatus.status === 'unhealthy') {
          console.warn('⚠️  Database health check failed on startup. The application may not function correctly.');
        }
      } catch (error) {
        // Don't throw - just log the error
        console.error('❌ Failed to perform database health check:', error);
      }
    }, 1000); // Delay by 1 second to avoid blocking startup
  } catch (error) {
    // Silently handle any initialization errors
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Failed to initialize database health check:', error);
    }
  }
}

// Run health check when this module is imported (non-blocking)
initializeDatabaseHealthCheck();
