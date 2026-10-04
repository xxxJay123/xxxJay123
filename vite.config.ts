import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this repo under /xxxJay123/. The deploy workflow passes
// BASE_PATH from actions/configure-pages; local dev stays at "/".
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 1200,
  },
});
