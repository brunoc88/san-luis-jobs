/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true, // Para usar describe, it, expect sin importarlos
    environment: 'node', // o 'jsdom' si vas a testear React
    include: ['test/**/*.test.ts'], // o '**/*.test.ts' si querés incluir src
    clearMocks: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Para que funcione tu path @/*
    },
  },
});