import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/camp-modular',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90000,
  outputDir: process.env.LMU_CAMP_TEST_OUTPUT ?? 'test-results-camp',
  use: {
    baseURL: 'http://127.0.0.1:5318',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    channel: process.env.LMU_BROWSER_CHANNEL,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1100 } } },
    {
      name: 'mobile',
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'node scripts/camp-preview.mjs serve',
    url: 'http://127.0.0.1:5318/refugio/acampamento',
    reuseExistingServer: true,
    timeout: 30000,
    env: {
      LMU_PREVIEW_PORT: '5318',
      LMU_CAMP_PREVIEW_ROOT:
        process.env.LMU_CAMP_PREVIEW_ROOT ??
        'D:/Codex-artifacts/camp-modular-20261103',
    },
  },
});
