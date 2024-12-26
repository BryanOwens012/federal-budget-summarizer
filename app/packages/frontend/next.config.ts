import { NextConfig } from "next";

// Define your Next.js configuration with type safety
const nextConfig: NextConfig = {
  output: "standalone", // Generate a standalone app for Railway
  reactStrictMode: true, // Enforce React strict mode
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL, // Custom environment variable
  },
  // Custom rewrites for mapping one route to another
  async rewrites() {
    return [
      {
        source: "/shop",
        destination: "/products",
      },
    ];
  },
  // Redirects example: Redirect /old-route to /new-route permanently (301)
  async redirects() {
    return [
      {
        source: "/old-route",
        destination: "/new-route",
        permanent: false,
      },
    ];
  },
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

// Export the configuration object
export default nextConfig;
