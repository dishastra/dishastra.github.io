import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/dishastra.github.io/",
  build: {
    // Improve chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          gsap: ['gsap'],
          three: ['three', '@react-three/fiber', '@react-three/drei', 'globe.gl']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Ensure proper source maps for debugging
    sourcemap: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'gsap', 'three']
  }
})
