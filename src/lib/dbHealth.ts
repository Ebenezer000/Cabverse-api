import { PrismaClient } from '@prisma/client';

export interface DatabaseHealthStatus {
  status: 'healthy' | 'unhealthy';
  message: string;
  responseTime?: number;
  error?: string;
}

/**
 * Performs a health check on the database connection
 * @param prisma - Prisma client instance
 * @returns Promise<DatabaseHealthStatus>
 */
export async function checkDatabaseHealth(prisma: PrismaClient): Promise<DatabaseHealthStatus> {
  const startTime = Date.now();
  
  try {
    // Log connection attempt details
    console.log('🔍 Attempting database connection...');
    
    // Get database URL info (without exposing credentials)
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      const urlParts = new URL(dbUrl);
      console.log(`📍 Database Host: ${urlParts.hostname}`);
      console.log(`📍 Database Port: ${urlParts.port}`);
      console.log(`📍 Database Name: ${urlParts.pathname.slice(1)}`);
      console.log(`📍 SSL Mode: ${urlParts.searchParams.get('sslmode') || 'not specified'}`);
    } else {
      console.log('⚠️  DATABASE_URL environment variable not found');
    }
    
    // Simple query to test database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = Date.now() - startTime;
    
    console.log(`✅ Database connection successful in ${responseTime}ms`);
    
    return {
      status: 'healthy',
      message: 'Database connection is healthy',
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    
    console.log(`❌ Database connection failed after ${responseTime}ms`);
    console.log(`❌ Error details: ${errorMessage}`);
    
    // Additional debugging for common connection issues
    if (errorMessage.includes('ECONNREFUSED')) {
      console.log('💡 Connection refused - Check if database server is running and accessible');
    } else if (errorMessage.includes('timeout')) {
      console.log('💡 Connection timeout - Check network connectivity and firewall settings');
    } else if (errorMessage.includes('authentication')) {
      console.log('💡 Authentication failed - Check database credentials');
    } else if (errorMessage.includes('does not exist')) {
      console.log('💡 Database does not exist - Check database name in connection string');
    }
    
    return {
      status: 'unhealthy',
      message: 'Database connection failed',
      responseTime,
      error: errorMessage
    };
  }
}

/**
 * Logs database health status to console with formatting
 * @param healthStatus - Database health status
 */
export function logDatabaseHealth(healthStatus: DatabaseHealthStatus): void {
  const timestamp = new Date().toISOString();
  const statusIcon = healthStatus.status === 'healthy' ? '✅' : '❌';
  
  console.log('\n=== Database Health Check ===');
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Status: ${statusIcon} ${healthStatus.status.toUpperCase()}`);
  console.log(`Message: ${healthStatus.message}`);
  
  if (healthStatus.responseTime !== undefined) {
    console.log(`Response Time: ${healthStatus.responseTime}ms`);
  }
  
  if (healthStatus.error) {
    console.log(`Error: ${healthStatus.error}`);
  }
  
  console.log('=============================\n');
}
