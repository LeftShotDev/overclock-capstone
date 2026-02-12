import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@langchain/core", "@langchain/langgraph", "pdf-parse", "mammoth"],
};

export default nextConfig;
