import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: { outDir: 'dist', emptyOutDir: true },
  plugins: [react()],
  test: {
    include: ['src/**/*.test.{js,jsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/letter/test/setup.js'],
    restoreMocks: true,
  },
});
