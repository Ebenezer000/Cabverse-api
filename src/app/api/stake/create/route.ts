import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safePrismaQuery } from "@/lib/prismaHelpers";
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
    cbvRateAtStake,
    returnPercentage,
    isEthStake,
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

  // Validate user exists (with retry on connection errors)
  const user = await safePrismaQuery(() =>
    prisma.user.findUnique({
      where: { address: userId }
    })
  );
  
  if (!user) {
    throw new Error("User not found");
  }

  // Calculate end time
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + duration * 24 * 60 * 60 * 1000);

  // Calculate returnPercentage from APY if not provided (APY in basis points = APY * 100)
  const calculatedReturnPercentage = returnPercentage ?? Math.floor(apy * 100);
  
  // Determine isEthStake from tokenSymbol if not provided
  const calculatedIsEthStake = isEthStake ?? (tokenSymbol.toUpperCase() === 'ETH');

  // Validate cbvRateAtStake - if not provided, we need to handle it
  // For now, if not provided, use 0 as a placeholder (this should be fetched from contract)
  // TODO: Fetch cbvRateAtStake from the contract based on the transaction or make it required
  if (cbvRateAtStake === undefined || cbvRateAtStake === null) {
    throw new Error("cbvRateAtStake is required. Please provide the CBV rate at stake time from the contract.");
  }

  // Create stake and transaction in a transaction (with retry on connection errors)
  const result = await safePrismaQuery(() =>
    prisma.$transaction(async (tx) => {
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
        poolCategory: poolCategory || null,
        cbvRateAtStake: cbvRateAtStake,
        returnPercentage: calculatedReturnPercentage,
        isEthStake: calculatedIsEthStake
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
    })
  );

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
