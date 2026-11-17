// Pruebas de integración: el codigo real del frontend contra el backend real
// Requiere el backend levantado (docker compose up -d) y se ejecuta con: npm run test:integracion
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: { jsdom: { url: 'http://localhost:5173' } }, // mismo origen que Vite → valida el CORS
    include: ['pruebas-integracion/**/*.real.spec.js'],
    testTimeout: 20000,
    fileParallelism: false,
  },
});
