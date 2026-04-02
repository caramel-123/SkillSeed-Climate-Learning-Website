import dns from 'node:dns'
// Prefer IPv4 for "localhost" on Windows so the browser and dev server agree (avoids ERR_CONNECTION_REFUSED to ::1).
dns.setDefaultResultOrder('ipv4first')

import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // host: true → listen on 0.0.0.0 so localhost / 127.0.0.1 / LAN all reach the dev server (OAuth callback).
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
