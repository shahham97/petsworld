import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/lib/storage/image-loader.ts",
  },
};

export default nextConfig;
