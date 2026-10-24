import type { NextConfig } from "next";
import { isShellReviewBuild } from "./src/features/appearance/review-build";

const nextConfig: NextConfig = {
  env: {
    SCHOOLFLOW_QA_REVISION: /^[a-f0-9]{40}$/.test(process.env.COMMIT_REF ?? "")
      ? process.env.COMMIT_REF
      : "",
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
