import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/app/utils/apiHandler";
import { CreateExternalTransactionRequest, TransactionResponse } from "@/app/utils/interfaces";
import { TransactionType } from "@prisma/client";

export const POST = apiHandler<TransactionResponse>(async (req: NextRequest) => {
  const body: CreateExternalTransactionRequest = await req.json();
  const { 
    userId, 
    type, 
    externalTxHash, 
    externalService,
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    recipient,
    amount,
    tokenAddress,
    gasUsed,
    gasPrice,
    blockNumber
  } = body;

  // Validate required fields
  if (!userId || !type || !externalTxHash || !externalService) {
    throw new Error("Missing required fields: userId, type, externalTxHash, externalService");
  }

  // Validate user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    throw new Error("User not found");
  }

  // Check if transaction with this external hash already exists
  const existingTransaction = await prisma.transaction.findFirst({
    where: { externalTxHash }
  });

  if (existingTransaction) {
    throw new Error("Transaction with this external hash already exists");
  }

  // Create external transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: type as TransactionType,
      status: 'CONFIRMED', // External transactions are typically confirmed
      fromToken: fromToken || null,
      toToken: toToken || null,
      fromAmount: fromAmount || null,
      toAmount: toAmount || null,
      recipient: recipient || null,
      amount: amount || null,
      tokenAddress: tokenAddress || null,
      externalTxHash,
      externalService,
      gasUsed: gasUsed || null,
      gasPrice: gasPrice || null,
      blockNumber: blockNumber || null
    }
  });

  return {
    data: {
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
    },
    message: "External transaction recorded successfully"
  };
});
