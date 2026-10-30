import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/memory-heist/',
  plugins: [react()],
  server: {
    watch: { ignored: ['**/.netlify/**', '**/.test-cache/**', '**/test-artifacts/**', '**/netlify-ready-game.zip'] },
  },
})
