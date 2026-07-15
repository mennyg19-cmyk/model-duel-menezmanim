import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
  // R9 — /demo/:screenId → /show/demo/:screenId
  async redirects() {
    return [
      {
        source: "/demo/:screenId",
        destination: "/show/demo/:screenId",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
