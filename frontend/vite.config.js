// vite.config.ts (ou .js si t'es en JavaScript)
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173, // ou un autre port si besoin
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // backend Node/Express
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
