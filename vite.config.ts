import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'plugin/code.ts'),
      formats: ['cjs'],
      fileName: () => 'code.js'
    },
    outDir: 'build',
    rollupOptions: {
      output: {
        format: 'cjs',
        exports: 'auto',
        inlineDynamicImports: true,
      },
    },
    target: 'es2015',
    minify: false,
  },
}); 