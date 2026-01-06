import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Update this base path with your GitHub repo name
  // Example: if your repo is github.com/username/leaf-and-spine-website
  // then base should be '/leaf-and-spine-website/'
  base: '/leaf-and-spine-website/',
})
