/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Alvos de compilação: navegadores contemporâneos (smartphones ~2020+ com SO/navegador atualizados).
// Veja a seção "Compatibilidade" do README.
export default defineConfig({
  build: { target: ['es2020', 'chrome87', 'safari14', 'firefox78'] },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Flux — protótipo acadêmico',
        short_name: 'Flux',
        description: 'Protótipo acadêmico de transferências internacionais simuladas. Nenhum dinheiro real.',
        lang: 'pt-BR',
        theme_color: '#0b5d4f',
        background_color: '#f4f5f0',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'] },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
