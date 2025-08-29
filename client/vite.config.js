import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    copyPublicDir: true,
    rollupOptions: {
      external: [
        // Tell Vite to ignore these scripts (don't try to bundle them)
        '/plugins/jquery/jquery.min.js',
        '/adminlte/js/adminlte.min.js',
        '/plugins/bootstrap/js/bootstrap.bundle.min.js',
        // Add other AdminLTE scripts if needed
      ]
    }
  }
})