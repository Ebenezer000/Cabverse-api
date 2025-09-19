import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/app/utils/apiHandler";
import { UpdateStakeRequest, StakeResponse } from "@/app/utils/interfaces";

export const PUT = apiHandler<StakeResponse>(async (req: NextRequest) => {
  const body: UpdateStakeRequest = await req.json();
  const { stakeId, duration, amount, status } = body;

  if (!stakeId) {
    throw new Error("Stake ID is required");
  }

  // Check if stake exists
  const existingStake = await prisma.stake.findUnique({
    where: { id: stakeId }
  });

  if (!existingStake) {
    throw new Error("Stake not found");
  }

  // Prepare update data
  const updateData: any = {};
  
  if (duration !== undefined) {
    updateData.duration = duration;
    // Recalculate end time if duration changes
    updateData.endTime = new Date(existingStake.startTime.getTime() + duration * 24 * 60 * 60 * 1000);
  }
  
  if (amount !== undefined) {
    updateData.amount = amount;
  }
  
  if (status !== undefined) {
    updateData.status = status as any;
  }

  // Update stake
  const stake = await prisma.stake.update({
    where: { id: stakeId },
    data: updateData
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
    message: "Stake updated successfully"
  };
});
