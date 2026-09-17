import { test, expect } from '@playwright/test';

const PAGES = [
  { href: '/', heading: '確定申告ダッシュボード' },
  { href: '/incomes', heading: '売上・源泉徴収の集計' },
  { href: '/expenses', heading: '経費・青色申告決算書の集計' },
  { href: '/deductions', heading: '所得控除の集計' },
] as const;

test.describe('ナビゲーションと共通 UI', () => {
  for (const page_ of PAGES) {
    test(`${page_.href} が表示される`, async ({ page }) => {
      await page.goto(page_.href);

      await expect(page.getByRole('heading', { level: 1 })).toHaveText(page_.heading);

      // 転記用ツールである旨の但し書きは全ページに出す
      await expect(
        page.getByText('このシステムは e-Tax への「転記用」の集計ツールです'),
      ).toBeVisible();

      // 対象年のプルダウン
      await expect(page.getByLabel('対象年')).toBeVisible();
    });
  }

  test('サイドバーから各ページへ遷移できる', async ({ page }) => {
    await page.goto('/');

    for (const item of PAGES.slice(1)) {
      await page.locator(`nav a[href="${item.href}"]`).click();
      await expect(page).toHaveURL(new RegExp(`${item.href}$`));
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(item.heading);
    }
  });

  test('対象年を変えると URL に year が付く', async ({ page }) => {
    await page.goto('/incomes');

    const previousYear = String(new Date().getFullYear() - 1);
    await page.getByLabel('対象年').selectOption(previousYear);

    await expect(page).toHaveURL(new RegExp(`year=${previousYear}`));
    await expect(page.getByText(`${previousYear}.01.01 〜 ${previousYear}.12.31`)).toBeVisible();
  });
});
