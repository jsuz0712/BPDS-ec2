import type { NextConfig } from "next";

// Exportación estática para servir la app con Apache en EC2 (guía AWS EC2 + GitHub Actions).
// "npm run build" genera la carpeta out/ con HTML, CSS y JS estáticos.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
