/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  assetsInclude: ["**/*.json"],
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  json: {
    stringify: true,
    namedExports: true,
  },
  server: {
    proxy: {
      // Add proxy rules if needed
    },
  },
});
