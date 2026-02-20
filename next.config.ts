import type { NextConfig } from "next";
import path from "path";

// Sentry is optional; only used when DSN is set and package is installed
let withSentryConfig: (config: NextConfig, opts: object) => NextConfig = (c) => c;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  withSentryConfig = require("@sentry/nextjs").withSentryConfig;
} catch {
  // @sentry/nextjs not installed
}

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: { root: path.join(__dirname) },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

const sentryConfig = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG ?? "",
      project: process.env.SENTRY_PROJECT ?? "",
      silent: !process.env.CI,
    })
  : nextConfig;

export default sentryConfig;
