import { defineConfig, devices } from '@playwright/test'

// Use PLAYWRIGHT_CHROMIUM_PATH para apontar um Chromium já instalado (opcional).
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined
const launchOptions = executablePath ? { executablePath } : {}

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  use: { baseURL: 'http://localhost:4173', launchOptions },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 180_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], launchOptions } },
    { name: 'mobile', use: { ...devices['Pixel 7'], launchOptions } },
  ],
})
