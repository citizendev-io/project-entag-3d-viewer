import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import apiRoutes from "vite-plugin-api-routes";
import tsconfigPaths from "vite-tsconfig-paths";

import cdn from 'vite-plugin-cdn-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cdn({
      modules: ['react', 'react-dom', 'react-router-dom'],
    }),
    apiRoutes({
      // Configuration options go here
    }),
    tsconfigPaths(),
  ],
  server: {
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors 'self' *",
    }
    // proxy: {
    //   '/api': {
    //     target: 'https://developer.api.autodesk.com', // The target API server
    //     changeOrigin: true,  // Change the origin of the request (for virtual hosted sites)
    //     secure: true,        // If using HTTPS
    //     rewrite: (path) => path.replace(/^\/api/, '') // Rewrite the URL path if needed
    //   },
    // },
  },
})