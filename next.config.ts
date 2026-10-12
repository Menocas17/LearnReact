import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  pageExtensions: ["ts", "tsx", "mdx"],
  // PGlite (Postgres en WASM) se usa en desarrollo local; debe quedarse fuera del bundle.
  serverExternalPackages: ["@electric-sql/pglite"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withMDX = createMDX({
  options: {
    // Con Turbopack los plugins se pasan por nombre (deben ser serializables).
    remarkPlugins: ["remark-gfm"],
  },
});

export default withMDX(nextConfig);
