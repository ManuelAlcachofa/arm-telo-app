import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vitest: segundo ejecutor de pruebas, nativo de Vite. Usa los mismos archivos *.spec que Karma.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/vitest.setup.js'],
    include: ['src/**/*.spec.{js,jsx}'],
    restoreMocks: true,
    coverage: { provider: 'v8', reporter: ['text', 'html'], reportsDirectory: 'coverage/vitest', include: ['src/**/*.{js,jsx}'], exclude: ['src/**/*.spec.*', 'src/test/**', 'src/main.jsx'] },
  },
});
