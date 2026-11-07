import { defineConfig, devices } from '@playwright/test';

const scope = process.env.LMU_VISUAL_SCOPE ?? 'world';
if (!['world', 'core', 'all'].includes(scope)) {
  throw new Error('LMU_VISUAL_SCOPE deve ser world, core ou all.');
}

export default defineConfig({
  testDir: './tests/visual',
  outputDir: 'test-results-visual',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    channel: process.env.LMU_BROWSER_CHANNEL,
  },
  projects: [
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-390',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'mobile-320',
      use: { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    command: 'npm run serve:build',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
