// utils/apiHandler.ts

import { NextRequest, NextResponse } from "next/server";
import { formatResponse } from "./response";

type Handler<T> = (req: NextRequest) => Promise<{
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}>;

// Dynamic CORS headers based on environment
// function getCorsHeaders(origin?: string) {
//   const allowedOrigins = [
//     "http://localhost:5173", // Vite dev server
//     "http://localhost:3000", // Next.js dev server
//     "http://localhost:4173", // Vite preview
//     "https://cabverse-dapp.vercel.app", // Production frontend
//     "https://cabverse-api.onrender.com", // Production API (for testing)
//     "http://localhost:3001", // Alternative local port
//     "http://127.0.0.1:5173", // Alternative localhost format
//     "http://127.0.0.1:3000", // Alternative localhost format
//   ];

//   const isAllowedOrigin = origin && allowedOrigins.includes(origin);
  
//   return {
//     "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "*", // Allow all origins in development
//     "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
//     "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, Accept, Origin",
//     "Access-Control-Allow-Credentials": "false",
//     "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
//   };
// }

export function apiHandler<T>(handler: Handler<T>, defaultMessage = "Action was successful") {
  return async function (req: NextRequest) {
    const origin = req.headers.get("origin");
    // const corsHeaders = getCorsHeaders("https://cabverse-dapp.vercel.app");
    
    console.log("Incoming origin:", origin);
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        // headers: corsHeaders,
      });
    }

    try {
      const { data, message, pagination } = await handler(req);
      return new NextResponse(
        JSON.stringify(formatResponse(200, message || defaultMessage, data, pagination)),
        {
          status: 200,
          headers: {
            // ...corsHeaders,
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
            // ...corsHeaders,
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
