import { defineConfig } from 'vite'
import vercel from 'vite-plugin-vercel'
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
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
    config: {
      routes: [
        {
          src: "/(.*)",
          dest: "/",
        },
        {
          src: "/viewer",
          dest: "/viewer"
        }
      ]
    }
  }
})