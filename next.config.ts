import type { NextConfig } from "next";
import { isShellReviewBuild } from "./src/features/appearance/review-build";

const nextConfig: NextConfig = {
  env: {
    SCHOOLFLOW_SHELL_REVIEW: String(
      isShellReviewBuild(
        process.env.CONTEXT,
        process.env.NEXT_PUBLIC_SUPABASE_URL,
      ),
    ),
  },
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
