import { defineConfig } from 'vite'
import vercel from 'vite-plugin-vercel'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vercel(),
    tsconfigPaths()
  ],
  server: {
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors 'self' *",
    }
  },
  vercel: {
    defaultMaxDuration: 20,
    redirects: [
      { source: "/(.*)", destination: "/", permanent: false },
    ],
  }
})