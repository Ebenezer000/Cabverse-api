import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { safePrismaQuery } from "@/lib/prismaHelpers";
import { apiHandler } from "@/app/utils/apiHandler";
import { UserSignupRequest, UserResponse } from "@/app/utils/interfaces";
import { AuthType } from "@prisma/client";

export const POST = apiHandler<UserResponse>(async (req: NextRequest) => {
  const body: UserSignupRequest = await req.json();
  const { address, email, username, authType } = body;

  // Validate required fields based on auth type
  if (authType === 'WALLET' && !address) {
    throw new Error("Address is required for wallet authentication");
  }
  
  if (authType === 'EMAIL' && !email) {
    throw new Error("Email is required for email authentication");
  }
  
  if (authType === 'BOTH' && (!address || !email)) {
    throw new Error("Both address and email are required for BOTH authentication");
  }

  // Check if user already exists (with retry on connection errors)
  if (address) {
    const existingUserByAddress = await safePrismaQuery(() =>
      prisma.user.findUnique({
        where: { address }
      })
    );
    if (existingUserByAddress) {
      return {
        data: {
          id: existingUserByAddress.id,
          address: existingUserByAddress.address || undefined,
          email: existingUserByAddress.email || undefined,
          username: existingUserByAddress.username || undefined,
          authType: existingUserByAddress.authType,
          createdAt: existingUserByAddress.createdAt.toISOString(),
          updatedAt: existingUserByAddress.updatedAt.toISOString()
        },
        message: "User Logged In successfully"
      };
    }
  }

  if (email) {
    const existingUserByEmail = await safePrismaQuery(() =>
      prisma.user.findUnique({
        where: { email }
      })
    );
    if (existingUserByEmail) {
      throw new Error("User with this email already exists");
    }
  }

  // Create new user (with retry on connection errors)
  const user = await safePrismaQuery(() =>
    prisma.user.create({
      data: {
        address: address || null,
        email: email || null,
        username: username || null,
        authType: authType as AuthType
      }
    })
  );

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
    message: "User created successfully"
  };
});
