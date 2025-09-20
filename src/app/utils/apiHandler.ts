// utils/apiHandler.ts

import { NextRequest, NextResponse } from "next/server";
import { formatResponse } from "./response";

type Handler<T> = (req: NextRequest) => Promise<{
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}>;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Replace '*' with your domain in production
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function apiHandler<T>(handler: Handler<T>, defaultMessage = "Action was successful") {
  return async function (req: NextRequest) {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    try {
      const { data, message, pagination } = await handler(req);
      return new NextResponse(
        JSON.stringify(formatResponse(200, message || defaultMessage, data, pagination)),
        {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred";
      return new NextResponse(
        JSON.stringify(formatResponse(500, msg, null)),
        {
          status: 500,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        }
      );
    }
  };
}

interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
