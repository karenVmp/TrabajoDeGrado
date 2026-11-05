import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const hasDittoCredentials =
    env.DITTO_BASE_URL && env.DITTO_USERNAME && env.DITTO_PASSWORD

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      host: true,
      ...(hasDittoCredentials && {
        proxy: {
          '/api/ditto': {
            target: env.DITTO_BASE_URL,
            changeOrigin: true,
            rewrite: (requestPath) => requestPath.replace(/^\/api\/ditto/, ''),
            configure: (proxy) => {
              proxy.on('proxyReq', (proxyRequest) => {
                const credentials = Buffer.from(
                  `${env.DITTO_USERNAME}:${env.DITTO_PASSWORD}`
                ).toString('base64')
                proxyRequest.setHeader('Authorization', `Basic ${credentials}`)
                proxyRequest.setHeader('ngrok-skip-browser-warning', 'true')
              })
            }
          }
        }
      })
    }
  }
})
