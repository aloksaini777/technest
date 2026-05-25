import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import federation from '@originjs/vite-plugin-federation';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'host_app',
      remotes: {
        chat_remote_app: 'https://project-9s53t.vercel.app/assets/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: false },
        'react-dom': { singleton: true, requiredVersion: false },
        'react-redux': { singleton: true, requiredVersion: false },
        '@reduxjs/toolkit': { singleton: true, requiredVersion: false },
      }
    }),
  ],
  build: {
    target: "esnext",
    modulePreload: false,
    cssCodeSplit: false,
  },
})
