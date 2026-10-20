import { defineConfig, devices } from '@playwright/test'

const port = process.env.PORT || 5173

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/report.json' }]],
  use: { baseURL: `http://localhost:${port}`, trace: 'off' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
