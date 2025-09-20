// utils/apiHandler.ts

import { NextRequest, NextResponse } from "next/server";
import { formatResponse } from "./response";

type Handler<T> = (req: NextRequest) => Promise<{
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}>;

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173", // Vite dev server
  "http://localhost:4173", // Vite preview
  "https://cabverse-dapp.vercel.app",
];

// Function to get CORS headers based on origin
function getCorsHeaders(origin: string | null) {
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);
  
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : ALLOWED_ORIGINS[0], // Default to first allowed origin
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function apiHandler<T>(handler: Handler<T>, defaultMessage = "Action was successful") {
  return async function (req: NextRequest) {
    const origin = req.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);
    
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      const { data, message, pagination } = await handler(req);
      return new NextResponse(
        JSON.stringify(formatResponse(200, message || defaultMessage, data, pagination)),
        {
          status: 200,
          headers: {
            ...corsHeaders,
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
            ...corsHeaders,
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
