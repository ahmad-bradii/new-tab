import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import tanStackRouterVite from "@tanstack/router-plugin/vite"; // Updated import statement

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [tanStackRouterVite(), react()],
  test: {
    environment: "happy-dom",
  },
  server: {
    proxy: {
      "/api": "https://search-api-r2w3.onrender.com/",
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
});
