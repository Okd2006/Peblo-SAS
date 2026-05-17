import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Tell Next.js to treat pdf-parse as a server-only external package
  // so it doesn't try to bundle it (it reads files from disk at runtime)
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "pdf2json"],
};

export default nextConfig;
