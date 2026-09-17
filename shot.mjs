import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
const pages = ['', 'incomes', 'expenses', 'deductions'];
for (const p of pages) {
  await page.goto(`http://localhost:3000/${p}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `/tmp/shots/${p || 'home'}-full.png`, fullPage: true });
}
await browser.close();
