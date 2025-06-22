import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        code: resolve(__dirname, 'plugin/code.ts'),
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`
    },
    outDir: 'build',
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        entryFileNames: '[name].js',
        format: 'es',
      },
    },
    target: 'es2015',
    minify: false,
  },
}); 