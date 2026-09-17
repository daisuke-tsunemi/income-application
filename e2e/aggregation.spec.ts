import { test, expect, type Locator, type Page } from '@playwright/test';

/** 「250,000 円」のような表示から数値だけ取り出す */
const toNumber = (text: string | null): number =>
  Number((text ?? '').replace(/[^\d-]/g, '')) || 0;

/** StatTiles の指定ラベルの値を読む */
const tileValue = async (page: Page, label: string) => {
  const value = page.locator('p', { hasText: new RegExp(`^${label}$`) }).first().locator('+ p');
  return toNumber(await value.textContent());
};

/**
 * 表の指定列を合算する。列の位置は見出し文字列から引くので、
 * 列が増減してもテストを直さずに済む。
 */
const sumColumn = async (table: Locator, header: string) => {
  const headers = await table.locator('thead th').allTextContents();
  const index = headers.findIndex((text) => text.includes(header));
  expect(index, `「${header}」列が見つからない（実際の見出し: ${headers.join(' / ')}）`).toBeGreaterThanOrEqual(0);

  const values = await table.locator(`tbody tr td:nth-child(${index + 1})`).allTextContents();
  return values.reduce((acc, text) => acc + toNumber(text), 0);
};

/** 見出しからセクションを引く */
const sectionByTitle = (page: Page, title: string) =>
  page.locator('section').filter({ has: page.getByRole('heading', { name: title }) }).first();

test.describe('集計結果の整合性', () => {
  test('ダッシュボードの所得金額は 売上 − 必要経費 と一致する', async ({ page }) => {
    await page.goto('/');

    const income = await tileValue(page, '売上（収入金額）');
    const expense = await tileValue(page, '必要経費');
    const net = await tileValue(page, '青色申告特別控除前の所得金額');

    expect(net).toBe(income - expense);
  });

  test('売上ページの合計が取引先別の集計と一致する', async ({ page }) => {
    await page.goto('/incomes');

    const total = await tileValue(page, '収入金額の合計');
    const table = sectionByTitle(page, '取引先（支払者）別の年間合計').locator('table');

    expect(await sumColumn(table, '収入金額')).toBe(total);
  });

  test('月別売上の12ヶ月分の合計が収入金額の合計と一致する', async ({ page }) => {
    await page.goto('/incomes');

    const total = await tileValue(page, '収入金額の合計');
    const section = sectionByTitle(page, '月別の売上（収入）金額');
    await expect(section.locator('tbody tr')).toHaveCount(12);

    expect(await sumColumn(section.locator('table'), '売上（収入）金額')).toBe(total);
  });

  test('経費ページの科目別合計が必要経費の合計と一致する', async ({ page }) => {
    await page.goto('/expenses');

    const total = await tileValue(page, '必要経費の合計');
    const table = sectionByTitle(page, '勘定科目別の年間合計').locator('table');

    expect(await sumColumn(table, '必要経費算入額')).toBe(total);
  });

  test('経費ページの科目は決算書の印字順に並ぶ', async ({ page }) => {
    await page.goto('/expenses');

    const rows = sectionByTitle(page, '勘定科目別の年間合計').locator('tbody tr');
    const badges = await rows.evaluateAll((items) =>
      items.map((row) => row.textContent?.includes('空欄行に記入') ?? false),
    );

    // 印字済みの科目が先、空欄行に書く科目が後ろにまとまっている
    const firstNonStandard = badges.indexOf(true);
    if (firstNonStandard !== -1) {
      expect(badges.slice(firstNonStandard).every(Boolean)).toBe(true);
    }
  });

  test('経費ページは 支払総額 = 必要経費 + 家事分 になる', async ({ page }) => {
    await page.goto('/expenses');

    const paid = await tileValue(page, '支払総額（経費分）');
    const business = await tileValue(page, '必要経費の合計');
    const personal = await tileValue(page, '家事分（経費外）');

    expect(business + personal).toBe(paid);
  });

  test('所得控除ページに種別ごとの合計が出る', async ({ page }) => {
    await page.goto('/deductions');

    const table = sectionByTitle(page, '控除の種類別の年間合計').locator('table');
    await expect(table.locator('tbody tr')).not.toHaveCount(0);

    // 支払額 − 補填額 = 差引 が各行で成り立つ
    const paid = await sumColumn(table, '支払金額の合計');
    const compensated = await sumColumn(table, '補填される金額');
    const net = await sumColumn(table, '差引');

    expect(net).toBe(paid - compensated);
  });
});
