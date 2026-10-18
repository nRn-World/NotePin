import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Second build pass: the content script as one self-contained classic script (no dynamic import()),
// which Firefox/AMO review flags as "unsafe call to import". The first pass (vite.config.ts) builds popup + background.
export default defineConfig({
  plugins: [react()],
  resolve: {alias: {'@': path.resolve(__dirname, '.')}},
  define: {'process.env.NODE_ENV': '"production"'},
  build: {
    emptyOutDir: false,
    copyPublicDir: false,
    lib: {
      entry: path.resolve(__dirname, 'src/content.tsx'),
      formats: ['iife'],
      name: 'NotePinContent',
      fileName: () => 'content.js',
    },
  },
});
