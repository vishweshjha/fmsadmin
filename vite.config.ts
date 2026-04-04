import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use '/' for Vercel and most hosts. For GitHub Pages under a subpath, set
// VITE_BASE_PATH=/repo-name/ in the build environment.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
})
