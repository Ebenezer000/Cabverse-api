import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/app/utils/apiHandler";
import { CreateTransferTransactionRequest, TransactionResponse } from "@/app/utils/interfaces";

export const POST = apiHandler<TransactionResponse>(async (req: NextRequest) => {
  const body: CreateTransferTransactionRequest = await req.json();
  const { 
    userId, 
    recipient, 
    amount, 
    tokenAddress, 
    externalTxHash, 
    externalService 
  } = body;

  // Validate required fields
  if (!userId || !recipient || !amount || !tokenAddress) {
    throw new Error("Missing required fields: userId, recipient, amount, tokenAddress");
  }

  // Validate user exists
  const user = await prisma.user.findUnique({
    where: { address: userId }
  });
  
  if (!user) {
    throw new Error("User not found");
  }

  // Create transfer transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      type: 'TRANSFER',
      status: 'PENDING',
      recipient,
      amount,
      tokenAddress,
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
    message: "Transfer transaction created successfully"
  };
});
