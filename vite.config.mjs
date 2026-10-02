import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import tanStackRouterVite from "@tanstack/router-plugin/vite"; // Updated import statement
import feedHandler from "./api/feed.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    tanStackRouterVite(),
    react(),
    {
      // Serves the Vercel feed function during `npm run dev`
      name: "local-feed-api",
      configureServer(server) {
        server.middlewares.use("/api/feed", (req, res) => {
          req.url = `/api/feed${req.url}`;
          feedHandler(req, res);
        });
      },
    },
  ],
  test: {
    environment: "happy-dom",
  },
  server: {
    proxy: {
      "/api/suggestions": {
        target: "https://search-api-r2w3.onrender.com",
        changeOrigin: true,
        secure: false,
      },
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
