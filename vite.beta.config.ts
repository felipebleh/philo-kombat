import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The game is the original client component. No Sites Worker or login is used.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "beta-dist", emptyOutDir: true },
  server: { host: "127.0.0.1", allowedHosts: ["terminal.local"] },
  preview: { host: "0.0.0.0" },
});
