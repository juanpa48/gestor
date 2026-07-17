import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/project-visualization/**'],
    },
  },
  build: {
    rollupOptions: {
      external: [/project-visualization/],
    },
  },
})
