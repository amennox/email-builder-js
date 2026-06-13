/// <reference types="vitest/config" />
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

/** Shim inline di cheerio per mjml-browser — usato sia in optimizeDeps (esbuild) sia nel resolver Vite. */
const cheerioShimPlugin = {
  name: 'cheerio-shim',
  setup(build: import('esbuild').PluginBuild) {
    build.onResolve({ filter: /^cheerio$/ }, () => ({
      path: 'cheerio',
      namespace: 'cheerio-shim-ns',
    }));
    build.onLoad({ filter: /^cheerio$/, namespace: 'cheerio-shim-ns' }, () => ({
      contents: 'module.exports = {}; module.exports.load = function() { return {}; };',
      loader: 'js' as const,
    }));
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Fallback per import statici / build — il plugin esbuild copre optimizeDeps.
      'cheerio': path.resolve(__dirname, './src/mjml/cheerio-shim.ts'),
    },
  },
  optimizeDeps: {
    // Applica lo shim cheerio anche durante il pre-bundling esbuild di mjml-browser.
    esbuildOptions: {
      plugins: [cheerioShimPlugin],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
