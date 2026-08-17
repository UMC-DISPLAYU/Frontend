import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/auth': {
        target: 'https://api.displayu.co.kr',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`,
      },
      '/v1': {
        target: 'https://api.displayu.co.kr',
        changeOrigin: true,
        rewrite: (path) => `/api${path}`,
      },
    },
  },
});
