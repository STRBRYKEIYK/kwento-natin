import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The letter lives at chica.keicodes.dev/third. The site root (/) is the library menu in menu/.
export default defineConfig({
  base: '/third/',
  build: { outDir: 'dist/third', emptyOutDir: true },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    restoreMocks: true,
  },
});
