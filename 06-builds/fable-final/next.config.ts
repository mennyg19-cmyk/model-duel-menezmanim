import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desktop packaging (R10) embeds this standalone server (F-DESKTOP-COUPLING fix for rebuild-a).
  output: "standalone",
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
