import { defineConfig } from 'vite'
import vercel from 'vite-plugin-vercel'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"
import apiRoutes from 'vite-plugin-api-routes'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vercel(),
    react(),
    tsconfigPaths(),
    apiRoutes({
      handler: './api',
    }),
  ],
  server: {
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors 'self' *",
    },
  }
})