import type { NextConfig } from "next";

/** Allow Supabase Storage public URLs to be used with next/image. */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
if (supabaseUrl) {
  try {
    remotePatterns.push({
      protocol: "https",
      hostname: new URL(supabaseUrl).hostname,
    });
  } catch {
    /* ignore malformed url at build time */
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns },
  eslint: {
    // Don't fail production builds on lint; we run lint separately.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
