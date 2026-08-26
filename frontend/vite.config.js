import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — always cached together
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Firebase — large SDK, change rarely
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // Recharts — heavy charting lib, separate cache bucket
          'vendor-recharts': ['recharts'],
          // Lucide icons — tree-shaken but still sizeable
          'vendor-lucide': ['lucide-react']
        }
      }
    },
    // Raise the size warning threshold slightly (default 500kb → 800kb)
    chunkSizeWarningLimit: 800
  }
});

