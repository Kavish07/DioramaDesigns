import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // shortcut: Cache Components (PPR) needs Suspense boundaries around every
  // session/DB read; not worth it for a single-owner app. Revisit if this
  // ever needs instant navigation/prefetching at scale.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
