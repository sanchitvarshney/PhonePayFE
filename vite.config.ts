import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [react(),sentryVitePlugin({
      org: "mscorpres-automation-pvt-ltd",
      project: "phonepay",
      // Auth token from SENTRY_AUTH_TOKEN env var (set in CI/build environment)
      authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
    })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
