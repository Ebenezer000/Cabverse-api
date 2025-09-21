import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/app/utils/apiHandler";
import { CreateStakeRequest, StakeResponse } from "@/app/utils/interfaces";

export const POST = apiHandler<StakeResponse>(async (req: NextRequest) => {
  const body: CreateStakeRequest = await req.json();
  const { 
    userId, 
    tokenAddress, 
    tokenSymbol, 
    amount, 
    duration, 
    apy, 
    isFlexible, 
    minDuration, 
    poolId, 
    poolName, 
    poolCategory,
    externalTxHash,
    externalService,
    gasUsed,
    gasPrice,
    blockNumber
  } = body;

  // Validate required fields
  if (!userId || !tokenAddress || !tokenSymbol || !amount || !duration || !apy) {
    throw new Error("Missing required fields: userId, tokenAddress, tokenSymbol, amount, duration, apy");
  }

  // Validate user exists
  const user = await prisma.user.findUnique({
    where: { address: userId }
  });
  
  if (!user) {
    throw new Error("User not found");
  }

  // Calculate end time
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + duration * 24 * 60 * 60 * 1000);

  // Create stake and transaction in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create stake
    const stake = await tx.stake.create({
      data: {
        userId: user.id,
        tokenAddress,
        tokenSymbol,
        amount,
        duration,
        startTime,
        endTime,
        apy,
        isFlexible: isFlexible || false,
        minDuration: minDuration || null,
        poolId: poolId || null,
        poolName: poolName || null,
        poolCategory: poolCategory || null
      }
    });

    // Create corresponding transaction record
    const transaction = await tx.transaction.create({
      data: {
        userId: user.id,
        type: 'STAKE',
        status: 'CONFIRMED',
        amount,
        tokenAddress,
        externalTxHash: externalTxHash || null,
        externalService: externalService || 'INTERNAL_STAKING',
        gasUsed: gasUsed || null,
        gasPrice: gasPrice || null,
        blockNumber: blockNumber || null
      }
    });

    return { stake, transaction };
  });

  const { stake } = result;

  return {
    data: {
      id: stake.id,
      userId: user.address || user.id, // Return the user's address or fallback to ID
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
    },
    message: "Stake created successfully"
  };
});
