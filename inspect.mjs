import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto('http://localhost:3000/incomes', { waitUntil: 'networkidle' });
const info = await page.evaluate(() => {
  const wrappers = Array.from(document.querySelectorAll('.t-wrapper'));
  return wrappers.map((w, i) => {
    const body = w.querySelector('.t-body');
    const table = w.querySelector('.t-table');
    const cs = (el) => el ? getComputedStyle(el) : null;
    const csw = cs(w), csb = cs(body), cst = cs(table);
    return {
      i,
      wrapperRect: w.getBoundingClientRect(),
      bodyRect: body?.getBoundingClientRect(),
      tableRect: table?.getBoundingClientRect(),
      bodyOverflow: csb?.overflow,
      bodyHeight: csb?.height,
      tableMaxHeight: cst?.maxHeight,
      tableHeight: cst?.height,
      tableOverflowY: cst?.overflowY,
      wrapperDisplay: csw?.display,
    };
  });
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
