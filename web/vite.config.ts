import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // anything starting with /api goes to the ASP.NET app
      "/api": {
        target: "http://localhost:5121",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""), // /api/dishes -> /dishes
      },
    },
  },
});
