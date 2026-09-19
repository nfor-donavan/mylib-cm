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
        name: "MyLib CM — Librarian Panel",
        short_name: "MyLib CM",
        description: "Catalog, checkout and inventory tool for school librarians",
        theme_color: "#0B1F4D",
        background_color: "#0B1F4D",
        display: "standalone",
        icons: [
          { src: "icon.png", sizes: "512x512", type: "image/png" },
          { src: "icon.png", sizes: "192x192", type: "image/png" },
        ],
      },
      workbox: {
        // Cache the app shell + student directory/catalog API responses so the
        // librarian panel keeps working through a power cut (see src/offline/).
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
