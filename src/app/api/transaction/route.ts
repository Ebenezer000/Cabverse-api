import { prisma } from "@/lib/prisma";
import { getPaginationParams, buildPrismaPagination } from "@/app/utils/response";
import { apiHandler } from "@/app/utils/apiHandler";
import { Prisma } from "@prisma/client";

export const GET = apiHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const transactionId = searchParams.get("id");
  const userId = searchParams.get("userId");
  const paginationParams = getPaginationParams(searchParams);
  const pagination = buildPrismaPagination(paginationParams);

  const allowedParams = ["page", "limit", "sortBy", "order", "id", "userId"];
  for (const param of searchParams.keys()) {
    if (!allowedParams.includes(param)) {
      throw new Error(`Invalid query parameter: ${param}`);
    }
  }

  const where: Prisma.TransactionWhereInput = {};
  if (transactionId) where.id = transactionId;
  if (userId) where.userId = userId;

  const transactions = await prisma.transaction.findMany({
    where,
    ...pagination,
  });

  const totalItems = await prisma.transaction.count({ where });
  const totalPages = Math.ceil(totalItems / (paginationParams.limit || 10));
  const currentPage = paginationParams.page || 1;

  if (transactions.length === 0) {
    if (transactionId) throw new Error("No transaction found with this ID.");
    if (userId) throw new Error("No transactions found for this user ID.");
  }

  return {
    data: transactions,
    message: "Transactions fetched successfully",
    pagination: {
      totalItems,
      totalPages,
      currentPage,
    },
  };
});
