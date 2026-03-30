import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Logging in...');
  await page.goto('https://stayright.vercel.app/login');
  
  // Use correct selectors from tests/e2e/auth.setup.ts
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByLabel(/email address/i).fill('testuser@example.com');
  await page.getByLabel(/^password$/i).fill('TestPassword123!');
  await page.locator('button[type="submit"]').click();

  console.log('Waiting for auth redirect...');
  await page.waitForURL('**/dashboard', { timeout: 15_000 });

  const cookies = await context.cookies();
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');
  console.log('Got cookies!');

  const extraHeaders = JSON.stringify({ Cookie: cookieString });

  const runLighthouse = (url: string, outputName: string) => {
    console.log(`Running Lighthouse for ${url}...`);
    try {
      execSync(`npx -y lighthouse ${url} --output=json --output-path=./${outputName}.json --only-categories=performance --chrome-flags="--headless" --extra-headers='${extraHeaders}'`, { stdio: 'inherit' });
      const raw = fs.readFileSync(`./${outputName}.json`, 'utf8');
      const data = JSON.parse(raw);
      console.log(`>>> ${outputName} Performance Score:`, data.categories.performance.score * 100);
      console.log(`>>> LCP:`, data.audits['largest-contentful-paint'].displayValue);
      console.log(`>>> FCP:`, data.audits['first-contentful-paint'].displayValue);
      console.log(`>>> CLS:`, data.audits['cumulative-layout-shift'].displayValue);
      console.log(`>>> TBT:`, data.audits['total-blocking-time'].displayValue);
    } catch (e: unknown) {
      console.error(`Failed on ${url}`, (e as Error).message);
    }
  };

  runLighthouse('https://stayright.vercel.app/', 'lh-landing');
  runLighthouse('https://stayright.vercel.app/dashboard', 'lh-dashboard');
  runLighthouse('https://stayright.vercel.app/trips', 'lh-trips');

  await browser.close();
}

run().catch(console.error);
