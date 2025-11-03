import { PrismaClient } from '@prisma/client';

/**
 * Retry a Prisma query with exponential backoff
 * Useful for handling transient database connection issues
 */
export async function retryPrismaQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error;
      
      // Check if it's a connection error that might be retryable
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isConnectionError = 
        errorMessage.includes('Server has closed the connection') ||
        errorMessage.includes('Connection closed') ||
        errorMessage.includes('ECONNRESET') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('timeout');

      // Don't retry if it's not a connection error or we've exhausted retries
      if (!isConnectionError || attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      console.log(`🔄 Retrying database query (attempt ${attempt + 1}/${maxRetries})...`);
    }
  }

  throw lastError;
}

/**
 * Execute a Prisma query with automatic retry on connection errors
 */
export async function safePrismaQuery<T>(
  queryFn: () => Promise<T>
): Promise<T> {
  return retryPrismaQuery(queryFn);
}

