import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // host:true so the dev server is reachable from the Windows browser over WSL2.
  server: { host: true, port: 5173, strictPort: true },
})
