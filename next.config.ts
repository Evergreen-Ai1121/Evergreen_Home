import path from "node:path";
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(process.cwd()),
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};
export default nextConfig;
