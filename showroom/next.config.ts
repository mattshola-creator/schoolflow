import type { NextConfig } from "next";

// A standalone, data-free export. Never loads the operational app's layout/proxy.
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: { unoptimized: true },
};
export default config;
