import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { firebaseMediaPlugin } from '../../scripts/media-build.mjs';

// The app lives at chica.keicodes.dev/date/, so everything is built under /date/.
export default defineConfig({
  base: "/date/",
  publicDir: false,
  plugins: [firebaseMediaPlugin(), react()],
  build: { outDir: "dist/date", emptyOutDir: true },
});
