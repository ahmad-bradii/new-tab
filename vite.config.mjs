import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tanStackRouterVite from "@tanstack/router-plugin/vite"; // Updated import statement

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
