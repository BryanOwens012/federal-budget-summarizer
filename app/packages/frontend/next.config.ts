import { NextConfig } from "next";

// Define your Next.js configuration with type safety
const nextConfig: NextConfig = {
  output: "standalone", // Generate a standalone app for Railway
  reactStrictMode: true, // Enforce React strict mode
  swcMinify: true, // Enable SWC-based minification for faster builds
  env: {
    API_URL: "http://localhost:8080", // Custom environment variable
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
  },
};

// Export the configuration object
export default nextConfig;
