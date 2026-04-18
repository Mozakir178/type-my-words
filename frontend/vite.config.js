import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa';

// export default defineConfig({
//   plugins: [
//     react(),
//     VitePWA({
//       registerType: 'autoUpdate',
//       manifest: {
//         name: 'TypeMyWords',
//         short_name: 'TypeMyWords',
//         description: 'Practice typing and improve your speed',
//         theme_color: '#0984e3',
//         background_color: '#ffffff',
//         display: 'standalone',
//         icons: [
//           {
//             src: '/icon-192.png',
//             sizes: '192x192',
//             type: 'image/png'
//           },
//           {
//             src: '/icon-512.png',
//             sizes: '512x512',
//             type: 'image/png'
//           }
//         ]
//       },
//       workbox: {
//         globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
//         runtimeCaching: [
//           {
//             urlPattern: /^https:\/\/api\.typingpractice\.com\/.*/i,
//             handler: 'NetworkFirst',
//             options: {
//               cacheName: 'api-cache',
//               expiration: {
//                 maxEntries: 50,
//                 maxAgeSeconds: 60 * 60 // 1 hour
//               }
//             }
//           }
//         ]
//       }
//     })
//   ],
//   server: {
//     port: 5173,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true
//       }
//     }
//   },
//   build: {
//     rollupOptions: {
//       output: {
//         manualChunks: {
//           'vendor': ['react', 'react-dom'],
//           'typing': ['framer-motion'],
//           'charts': ['recharts'],
//           'utils': ['axios', 'socket.io-client', 'date-fns']
//         }
//       }
//     }
//   }
// });