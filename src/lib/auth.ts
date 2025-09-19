import { prisma } from '@/lib/prisma';

// Get user by ID
export async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      address: true,
      email: true,
      username: true,
      authType: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

// Get user by address
export async function getUserByAddress(address: string) {
  return await prisma.user.findUnique({
    where: { address },
    select: {
      id: true,
      address: true,
      email: true,
      username: true,
      authType: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

// Get user by email
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      address: true,
      email: true,
      username: true,
      authType: true,
      createdAt: true,
      updatedAt: true
    }
  });
}
