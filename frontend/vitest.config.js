import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [
    vue({
      template: {
        transformAssetUrls
      }
    }),
    quasar({
      sassVariables: 'src/css/quasar.variables.scss'
    })
  ],
  resolve: {
    alias: {
      '@': srcDir,
      '~': srcDir,
      src: srcDir,
      assets: fileURLToPath(new URL('./src/assets', import.meta.url)),
      components: fileURLToPath(new URL('./src/components', import.meta.url)),
      boot: fileURLToPath(new URL('./src/boot', import.meta.url)),
      layouts: fileURLToPath(new URL('./src/layouts', import.meta.url)),
      pages: fileURLToPath(new URL('./src/pages', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup/test-setup.js'],
    css: true,
    coverage: {
      provider: 'v8',
      all: true,
      reportOnFailure: true,
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,vue}'],
      exclude: ['src/**/__tests__/**', 'tests/**'],
      lines: 0.8,
      statements: 0.8,
      functions: 0.8,
      branches: 0.8
    }
  }
})
