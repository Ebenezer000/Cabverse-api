import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/app/utils/apiHandler";
import { UserResponse } from "@/app/utils/interfaces";

interface UpdateUserRequest {
  userId: string;
  username?: string;
  email?: string;
}

export const PUT = apiHandler<UserResponse>(async (req: NextRequest) => {
  const body: UpdateUserRequest = await req.json();
  const { userId, username, email } = body;

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { address: userId }
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  // Prepare update data
  const updateData: {
    username?: string;
    email?: string;
  } = {};
  
  if (username !== undefined) {
    updateData.username = username;
  }
  
  if (email !== undefined) {
    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });
      if (emailExists) {
        throw new Error("Email is already taken by another user");
      }
    }
    updateData.email = email;
  }

  // Update user
  const user = await prisma.user.update({
    where: { id: existingUser.id },
    data: updateData
  });

  return {
    data: {
      id: user.id,
      address: user.address || undefined,
      email: user.email || undefined,
      username: user.username || undefined,
      authType: user.authType,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    },
    message: "User profile updated successfully"
  };
});
