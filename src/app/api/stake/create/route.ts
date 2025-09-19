import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/app/utils/apiHandler";
import { CreateStakeRequest, StakeResponse } from "@/app/utils/interfaces";

export const POST = apiHandler<StakeResponse>(async (req: NextRequest) => {
  const body: CreateStakeRequest = await req.json();
  const { userId, tokenAddress, tokenSymbol, amount, duration, apy, isFlexible, minDuration } = body;

  // Validate required fields
  if (!userId || !tokenAddress || !tokenSymbol || !amount || !duration || !apy) {
    throw new Error("Missing required fields: userId, tokenAddress, tokenSymbol, amount, duration, apy");
  }

  // Validate user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    throw new Error("User not found");
  }

  // Calculate end time
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + duration * 24 * 60 * 60 * 1000);

  // Create stake
  const stake = await prisma.stake.create({
    data: {
      userId,
      tokenAddress,
      tokenSymbol,
      amount,
      duration,
      startTime,
      endTime,
      apy,
      isFlexible: isFlexible || false,
      minDuration: minDuration || null
    }
  });

  return {
    data: {
      id: stake.id,
      userId: stake.userId,
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
      createdAt: stake.createdAt.toISOString(),
      updatedAt: stake.updatedAt.toISOString()
    },
    message: "Stake created successfully"
  };
});
