import type { NextConfig } from "next";

const nextConfig = {
  // 其他配置...
  allowedDevOrigins: [
    "*.csb.app", // 您的 CodeSandbox URL
    "http://localhost:3000", // 本地開發
    "http://localhost:3306",
    // 加更多如 '*.csb.app' 如果需要
  ],
};

module.exports = nextConfig;
