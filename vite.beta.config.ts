import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const base = process.env.PHILO_KOMBAT_BASE || "/";
const assetBase = base.replace(/\/$/, "");

// The game is the original client component. No Sites Worker or login is used.
export default defineConfig({
  base,
  plugins: [
    react(),
    {
      name: "philo-kombat-public-assets",
      apply: "build",
      renderChunk(code) {
        if (!assetBase) return null;

        // Vite rewrites static HTML and CSS URLs. The game also builds URLs
        // inside JavaScript for sprites, audio, video and preloading.
        return code.replace(/(["'`(])\/(game|audio)\//g, `$1${assetBase}/$2/`);
      },
    },
  ],
  build: { outDir: "beta-dist", emptyOutDir: true },
  server: { host: "127.0.0.1", allowedHosts: ["terminal.local"] },
  preview: { host: "0.0.0.0" },
});
