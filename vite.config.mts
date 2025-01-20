import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import apiRoutes from "vite-plugin-api-routes";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    apiRoutes({
      // Configuration options go here
    }),
    tsconfigPaths(),
  ],
  server: {
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors 'self' *",
    },
    proxy: {
      '/api': {
        target: 'https://entag.project.citizendev.io', // The target API server
        changeOrigin: true,  // Change the origin of the request (for virtual hosted sites)
        secure: true,        // If using HTTPS
        rewrite: (path) => path.replace(/^\/api/, '') // Rewrite the URL path if needed
      },
    },
  }
  // build: {
  //   rollupOptions: {
  //     external: ["react", "react-router", "react-router-dom"],
  //     output: {
  //       globals: {
  //         react: "React",
  //       },
  //     },
  //   },
  // }
})