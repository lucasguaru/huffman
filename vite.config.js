import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Ajuste para GitHub Pages:
  // - se o repositório se chama "huffman", o base costuma ser "/huffman/"
  // - se for um domínio customizado, use "/"
  base: '/huffman/',
  plugins: [react()],
})
