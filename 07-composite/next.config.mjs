/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client"],
  // forbidden()/unauthorized() + forbidden.tsx 403 boundary (Next 15.x flag).
  experimental: { authInterrupts: true },
  // Baseline security headers on every response: no framing (clickjacking),
  // no MIME sniffing, no full-URL referrers cross-origin.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Baseline CSP: self + inline styles (Tailwind), Stripe hosted
          // checkout (redirect), Mapbox tiles/geocode, Vercel Blob media.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://*.mapbox.com",
              "font-src 'self' data:",
              "connect-src 'self' https://api.mapbox.com https://*.mapbox.com https://api.stripe.com https://*.public.blob.vercel-storage.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self' https://checkout.stripe.com",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
