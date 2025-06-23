import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'plugin/code.ts'),
      formats: ['iife'],
      name: 'code',
      fileName: () => 'code.js'
    },
    outDir: 'build',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        extend: true,
        inlineDynamicImports: true
      }
    },
    target: 'es2015',
    minify: false, // Easier to debug
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
}); 