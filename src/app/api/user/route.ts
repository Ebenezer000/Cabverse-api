import { prisma } from "@/lib/prisma";
import { getPaginationParams, buildPrismaPagination } from "@/app/utils/response";
import { apiHandler } from "@/app/utils/apiHandler";
import { Prisma } from "@prisma/client";

interface CreateUserSchema {
  email: string;
  address: string;
  username?: string;
  password?: string;
  role?: "USER" | "MERCHANT" | "BOTH";
}

export const GET = apiHandler(async (req) => {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("id");
    const email = searchParams.get("email");
    const address = searchParams.get("address");
    const username = searchParams.get("username");
    const role = searchParams.get("role");
    const rewardId = searchParams.get("rewardId");
    const brandName = searchParams.get("brandName");
    const brandId = searchParams.get("brandId");

    const paginationParams = getPaginationParams(searchParams);
    const pagination = buildPrismaPagination(paginationParams);

    const allowedParams = [
      "page", "limit", "sortBy", "order",
      "id", "email", "address", "username",
      "role", "rewardId", "brandName", "brandId"
    ];

    for (const param of searchParams.keys()) {
      if (!allowedParams.includes(param)) {
        throw new Error(`Invalid query parameter: ${param}`);
      }
    }

    const where: Prisma.UserWhereInput = {
      ...(userId && { id: userId }),
      ...(email && { email }),
      ...(address && { address }),
      ...(username && { username }),
      ...(role && { role: role as "USER" | "MERCHANT" | "BOTH" }),
      ...(rewardId && {
        rewards: {
          some: { rewardId }
        }
      }),
      ...(brandName && {
        rewards: {
          some: { brandName }
        }
      }),
      ...(brandId && {
        rewards: {
          some: { brandId }
        }
      }),
    };

    const users = await prisma.user.findMany({
      where,
      ...pagination,
    });

    const totalItems = await prisma.user.count({ where });
    const totalPages = Math.ceil(totalItems / (paginationParams.limit || 10));
    const currentPage = paginationParams.page || 1;

    if (users.length === 0) {
      if (userId) throw new Error("No transactions found for this User ID.");
      if (rewardId) throw new Error("No users found owning this Reward ID.");
      if (email) throw new Error("No transactions found for this Email.");
      if (address) throw new Error("No transactions found for this User Address.");
      if (username) throw new Error("No transactions found for this User Name.");
      if (role) throw new Error("No users found with this Role.");
      if (brandName) throw new Error("No users found with this Brand Name.");
      if (brandId) throw new Error("No users found with this Brand ID.");
    }

    return {
      data: users,
      message: "Fetched User Details Successfully",
      pagination: {
        totalItems,
        totalPages,
        currentPage,
      },
    };
  } catch (error) {
    console.error("Internal fetch error", error instanceof Error ? error.message : error);
    throw new Error("Failed to fetch users");
  }
});

export const POST = apiHandler(async (req) => {
  try {
    const body = (await req.json()) as Partial<CreateUserSchema>;

    // Manual validation
    if (!body.email || !body.address) {
      throw new Error("Missing required fields: email, address");
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        address: body.address,
        username: body.username || body.email,
        password: body.password || "",
        role: body.role || "USER",
      },
    });

    console.log("User created successfully:", user);

    return {
      data: user,
      message: "User created successfully",
    };
  } catch (error) {
    console.error("Internal create error", error instanceof Error ? error.message : error);
    throw new Error("Failed to create user");
  }
});