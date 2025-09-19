import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/app/utils/apiHandler";
import { getPaginationParams, buildPrismaPagination } from "@/app/utils/response";
import { TransactionResponse } from "@/app/utils/interfaces";
import { TransactionType, TransactionStatus } from "@prisma/client";

export const GET = apiHandler<TransactionResponse[]>(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const externalService = searchParams.get('externalService');
  
  const paginationOptions = getPaginationParams(searchParams);
  const pagination = buildPrismaPagination(paginationOptions);

  // Build where clause
  const where: {
    userId?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    externalService?: string;
  } = {};
  if (userId) {
    where.userId = userId;
  }
  if (type) {
    where.type = type as TransactionType;
  }
  if (status) {
    where.status = status as TransactionStatus;
  }
  if (externalService) {
    where.externalService = externalService;
  }

  // Get transactions with pagination
  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
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
    prisma.transaction.count({ where })
  ]);

  const totalPages = Math.ceil(totalCount / paginationOptions.limit!);

  return {
    data: transactions.map(transaction => ({
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      status: transaction.status,
      fromToken: transaction.fromToken || undefined,
      toToken: transaction.toToken || undefined,
      fromAmount: transaction.fromAmount || undefined,
      toAmount: transaction.toAmount || undefined,
      swapRate: transaction.swapRate || undefined,
      recipient: transaction.recipient || undefined,
      amount: transaction.amount || undefined,
      tokenAddress: transaction.tokenAddress || undefined,
      externalTxHash: transaction.externalTxHash || undefined,
      externalService: transaction.externalService || undefined,
      gasUsed: transaction.gasUsed || undefined,
      gasPrice: transaction.gasPrice || undefined,
      blockNumber: transaction.blockNumber || undefined,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString()
    })),
    message: "Transactions retrieved successfully",
    pagination: {
      totalItems: totalCount,
      totalPages,
      currentPage: paginationOptions.page!
    }
  };
});
