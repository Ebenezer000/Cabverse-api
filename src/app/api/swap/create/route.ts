import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/app/utils/apiHandler";
import { CreateSwapTransactionRequest, TransactionResponse } from "@/app/utils/interfaces";

export const POST = apiHandler<TransactionResponse>(async (req: NextRequest) => {
  const body: CreateSwapTransactionRequest = await req.json();
  const { 
    userId, 
    fromToken, 
    toToken, 
    fromAmount, 
    toAmount, 
    swapRate, 
    externalTxHash, 
    externalService 
  } = body;

  // Validate required fields
  if (!userId || !fromToken || !toToken || !fromAmount || !toAmount || !swapRate) {
    throw new Error("Missing required fields: userId, fromToken, toToken, fromAmount, toAmount, swapRate");
  }

  // Validate user exists
  const user = await prisma.user.findUnique({
    where: { address: userId }
  });
  
  if (!user) {
    throw new Error("User not found");
  }

  // Create swap transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: 'SWAP',
      status: 'PENDING',
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      swapRate,
      externalTxHash: externalTxHash || null,
      externalService: externalService || null
    }
  });

  return {
    data: {
      id: transaction.id,
      userId: user.address || user.id, // Return the user's address or fallback to ID
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
    message: "Swap transaction created successfully"
  };
});
