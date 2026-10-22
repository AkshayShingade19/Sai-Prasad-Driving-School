import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Bind to all interfaces so a local tunnel (Cloudflare Tunnel, ngrok, etc.)
    // can reach the dev server from outside the machine.
    host: true,
    port: 5173,
    // Fail instead of silently switching ports, so scripts always know the URL.
    strictPort: true,
    // Vite 5 blocks requests whose Host header is not in the allow-list.
    // A public tunnel sends an arbitrary hostname (e.g. *.trycloudflare.com),
    // so the host must be accepted for the tunnel to work at all.
    allowedHosts: true,
    // Same-origin reverse proxy: the browser only ever talks to this origin,
    // and /api is forwarded to the NestJS backend. This keeps the public URL
    // single-host, avoids CORS entirely, and never exposes the backend port.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
  },
});
