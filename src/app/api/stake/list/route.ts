import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/app/utils/apiHandler";
import { getPaginationParams, buildPrismaPagination } from "@/app/utils/response";
import { StakeResponse } from "@/app/utils/interfaces";
import { StakeStatus } from "@prisma/client";

export const GET = apiHandler<StakeResponse[]>(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const status = searchParams.get('status');
  
  const paginationOptions = getPaginationParams(searchParams);
  const pagination = buildPrismaPagination(paginationOptions);

  // Build where clause
  const where: {
    userId?: string;
    status?: StakeStatus;
  } = {};
  
  if (userId) {
    // First find the user by address to get their internal ID
    const user = await prisma.user.findUnique({
      where: { address: userId }
    });
    if (user) {
      where.userId = user.id;
    } else {
      // If user not found, return empty result
      return {
        data: [],
        message: "No stakes found for user",
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: paginationOptions.page!
        }
      };
    }
  }
  
  if (status) {
    where.status = status as StakeStatus;
  }

  // Get stakes with pagination
  const [stakes, totalCount] = await Promise.all([
    prisma.stake.findMany({
      where,
      ...pagination,
      include: {
        user: {
          select: {
            id: true,
            address: true,
            email: true,
            username: true
          }
        }
      }
    }),
    prisma.stake.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / paginationOptions.limit!);

  return {
    data: stakes.map(stake => ({
      id: stake.id,
      userId: stake.user.address || stake.user.id, // Return the user's address or fallback to ID
      tokenAddress: stake.tokenAddress,
      tokenSymbol: stake.tokenSymbol,
      amount: stake.amount,
      duration: stake.duration,
      startTime: stake.startTime.toISOString(),
      endTime: stake.endTime.toISOString(),
      apy: stake.apy,
      status: stake.status,
      isFlexible: stake.isFlexible,
      minDuration: stake.minDuration || undefined,
      poolId: stake.poolId || undefined,
      poolName: stake.poolName || undefined,
      poolCategory: stake.poolCategory || undefined,
      createdAt: stake.createdAt.toISOString(),
      updatedAt: stake.updatedAt.toISOString()
    })),
    message: "Stakes retrieved successfully",
    pagination: {
      totalItems: totalCount,
      totalPages,
      currentPage: paginationOptions.page!
    }
  };
});
