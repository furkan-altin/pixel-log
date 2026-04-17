import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // YENİ: PWA Sihirbazımız

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Güncelleme gelince otomatik yenile
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], // Varsa ekstra ikonlar
      manifest: {
        name: 'Pixer Log - Gaming Vault', // Uzun ad
        short_name: 'Pixer Log', // Telefonda ikonun altında yazacak kısa ad
        description: 'Explore games and manage your personal gaming vault.',
        theme_color: '#eab308', // Uygulamanın üst bar (tema) rengi (Sarı)
        background_color: '#0a0a0a', // Uygulama açılırken arkadaki renk (Koyu)
        display: 'standalone', // Tarayıcı çubuğunu gizle, tam ekran (gerçek uygulama) yap!
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any' // Her cihaza uyumlu ikon
          }
        ]
      }
    })
  ],
})