import type { NextConfig } from "next";

// Exportación estática: el HTML se sirve desde EC2 (Apache).
// Con assetPrefix, los estáticos de _next/ se piden al bucket de S3.
// ASSET_PREFIX solo existe durante el despliegue (GitHub Actions); en local queda vacío.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  assetPrefix: process.env.ASSET_PREFIX || undefined,
};

export default nextConfig;
