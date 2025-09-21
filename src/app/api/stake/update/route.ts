import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/app/utils/apiHandler";
import { UpdateStakeRequest, StakeResponse } from "@/app/utils/interfaces";
import { StakeStatus } from "@prisma/client";

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
  const updateData: {
    duration?: number;
    endTime?: Date;
    amount?: number;
    status?: StakeStatus;
  } = {};
  
  if (duration !== undefined) {
    updateData.duration = duration;
    // Recalculate end time if duration changes
    updateData.endTime = new Date(existingStake.startTime.getTime() + duration * 24 * 60 * 60 * 1000);
  }
  
  if (amount !== undefined) {
    updateData.amount = amount;
  }
  
  if (status !== undefined) {
    updateData.status = status as StakeStatus;
  }

  // Update stake and create transaction if unstaking
  const result = await prisma.$transaction(async (tx) => {
    // Update stake
    const stake = await tx.stake.update({
      where: { id: stakeId },
      data: updateData
    });

    // Create transaction record if status is being changed to UNSTAKED
    if (status === 'UNSTAKED') {
      await tx.transaction.create({
        data: {
          userId: existingStake.userId,
          type: 'UNSTAKE',
          status: 'CONFIRMED',
          amount: existingStake.amount,
          tokenAddress: existingStake.tokenAddress,
          externalTxHash: null,
          externalService: 'INTERNAL_UNSTAKING'
        }
      });
    }

    return stake;
  });

  const stake = result;

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
