import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'guide-route-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/guide' || req.url === '/guide/' || req.url?.startsWith('/guide?')) {
            req.url = req.url.replace('/guide', '/guide/index.html');
          }
          next();
        });
      }
    }
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
