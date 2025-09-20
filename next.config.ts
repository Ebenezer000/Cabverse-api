import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove global CORS headers - let apiHandler handle CORS per request
  // This allows dynamic origin handling based on the request origin
};

export default nextConfig;
