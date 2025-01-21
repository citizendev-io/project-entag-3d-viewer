import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import apiRoutes from "vite-plugin-api-routes";
import tsconfigPaths from "vite-tsconfig-paths";
import vitePluginVercelApi from 'vite-plugin-vercel-api';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    apiRoutes({
      // Configuration options go here
    }),
    tsconfigPaths(),
    vitePluginVercelApi(
      {
        apiDir: '/src/api'
      }
    )
  ],
  server: {
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Content-Security-Policy': "frame-ancestors 'self' *",
    }
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