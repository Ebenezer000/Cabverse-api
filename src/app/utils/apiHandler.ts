// utils/apiHandler.ts

import { NextRequest, NextResponse } from "next/server";
import { formatResponse } from "./response";

type Handler<T> = (req: NextRequest) => Promise<{
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}>;

// Dynamic CORS headers based on environment
export function apiHandler<T>(handler: Handler<T>, defaultMessage = "Action was successful") {
  return async function (req: NextRequest) {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const userAgent = req.headers.get("user-agent");
    
    console.log("=== Request Debug Info ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    console.log("Incoming origin:", origin);
    console.log("Referer:", referer);
    console.log("User-Agent:", userAgent);
    console.log("=========================");

    try {
      const { data, message, pagination } = await handler(req);
      return new NextResponse(
        JSON.stringify(formatResponse(200, message || defaultMessage, data, pagination)),
        {
          status: 200,
          headers: {
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
