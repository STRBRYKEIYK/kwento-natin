import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { firebaseMediaPlugin } from './scripts/media-build.mjs';

export default defineConfig({
  build: { outDir: 'dist', emptyOutDir: true },
  publicDir: false,
  plugins: [firebaseMediaPlugin(), react()],
  test: {
    include: ['src/**/*.test.{js,jsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/letter/test/setup.js'],
    restoreMocks: true,
  },
});
