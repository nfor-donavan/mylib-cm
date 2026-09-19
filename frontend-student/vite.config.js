import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.png"],
      manifest: {
        name: "MyLib CM — Student Portal",
        short_name: "MyLib CM",
        description: "Check due dates, reserve books, and download digital resources",
        theme_color: "#0B1F4D",
        background_color: "#0B1F4D",
        display: "standalone",
        icons: [
          { src: "icon.png", sizes: "512x512", type: "image/png" },
          { src: "icon.png", sizes: "192x192", type: "image/png" },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/books/,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "catalog-cache" },
          },
        ],
      },
    }),
  ],
  server: { port: 5173 },
});
