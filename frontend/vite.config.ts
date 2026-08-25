import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Backend host differs between the dev compose stack and a bare `npm run dev`
const backend = process.env.BACKEND_URL || 'http://backend-dev:6200'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': backend
    }
  },
  build: {
    outDir: 'build',
    sourcemap: false
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts'
  }
})
