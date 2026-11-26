import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The app lives at chica.keicodes.dev/date/, so everything is built under /date/.
export default defineConfig({
  base: "/date/",
  plugins: [react()],
  build: { outDir: "dist/date", emptyOutDir: true },
});
