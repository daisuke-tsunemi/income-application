import { jst } from './datetime';
import type { Deduction, Expense, Income } from './types';
import {
  ASSET_TYPE_EXPENSE,
  ASSET_TYPE_SMALL_SPECIAL,
  CONSUMPTION_TAX_RELIEF_BY_YEAR,
  DEDUCTION_TYPE_ORDER,
  DEPRECIABLE_THRESHOLD,
  EXPENSE_CATEGORY_LIMIT,
  EXPENSE_CATEGORY_ORDER,
  INSURANCE_CATEGORY_ORDER,
  MEDICAL_DEDUCTION_TYPE,
  MIXED_USE_PRONE_CATEGORIES,
  SMALL_SPECIAL_ANNUAL_LIMIT,
  TAX_RATE_DECIMAL,
  TAX_RATE_UNSET_LABEL,
  type ConsumptionTaxRelief,
} from '@/constants';
import { EMPTY_LABEL } from './format';

/* ------------------------------------------------------------------ *
 * 共通ヘルパー
 * ------------------------------------------------------------------ */

/** microCMS の select は配列で返るため、先頭の値を採用する */
const selectOf = (value?: string[] | null): string => value?.[0] ?? EMPTY_LABEL;

/** 事業割合は未設定を 100%（全額事業用）とみなし、0〜100 に丸める */
export const businessRatioOf = (expense: Expense): number => {
  const ratio = expense.business_ratio;
  if (ratio === undefined || ratio === null || Number.isNaN(Number(ratio))) return 100;
  return Math.min(100, Math.max(0, Number(ratio)));
};

/**
 * 必要経費に算入する金額 = 支払総額 × 事業割合。
 * 申告書に載せるのはこの値。1円未満は明細ごとに切り捨てる（合算後に丸めると端数がズレる）。
 */
export const businessAmountOf = (expense: Expense): number =>
  Math.floor((expense.amount ?? 0) * (businessRatioOf(expense) / 100));

/** 経費区分。未設定は「経費」とみなす（大半の明細は10万円未満のため） */
export const assetTypeOf = (expense: Expense): string =>
  expense.asset_type?.[0] ?? ASSET_TYPE_EXPENSE;

/** 決算書の「経費」欄に計上する明細か。それ以外は減価償却費として別扱いになる */
export const isPlainExpense = (expense: Expense): boolean =>
  assetTypeOf(expense) === ASSET_TYPE_EXPENSE;

/**
 * 10万円以上なのに経費区分が「経費」のままになっている明細か。
 * 区分の設定漏れは必要経費の過大計上に直結するため、入力を促す。
 */
export const needsAssetTypeReview = (expense: Expense): boolean =>
  isPlainExpense(expense) && (expense.amount ?? 0) >= DEPRECIABLE_THRESHOLD;

/** 経費区分の設定漏れが疑われる明細（金額の大きい順） */
export const buildAssetTypeReviews = (expenses: Expense[]): Expense[] =>
  expenses.filter(needsAssetTypeReview).sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));

export type AssetGroup = {
  assetType: string;
  /** 事業割合を反映した取得価額の合計 */
  businessAmount: number;
  count: number;
  items: Expense[];
};

/** 減価償却の対象（＝経費欄に計上しない明細）を区分ごとにまとめる */
export const buildAssetGroups = (expenses: Expense[]): AssetGroup[] => {
  const groups = new Map<string, AssetGroup>();

  for (const expense of expenses) {
    if (isPlainExpense(expense)) continue;
    const assetType = assetTypeOf(expense);
    const current = groups.get(assetType) ?? { assetType, businessAmount: 0, count: 0, items: [] };
    current.businessAmount += businessAmountOf(expense);
    current.count += 1;
    current.items.push(expense);
    groups.set(assetType, current);
  }

  return Array.from(groups.values()).sort((a, b) => b.businessAmount - a.businessAmount);
};

/* ------------------------------------------------------------------ *
 * KPI サマリー
 * ------------------------------------------------------------------ */

export type TaxSummary = {
  /** 売上（収入）金額の合計 */
  incomeTotal: number;
  /** 源泉徴収税額の合計 */
  withholdingTotal: number;
  /** 決算書「経費」欄の合計（事業割合を反映した額。減価償却の対象は含まない） */
  expenseTotal: number;
  /** 減価償却の対象になる取得価額の合計（当年の償却額ではない） */
  assetTotal: number;
  /** 所得控除の合計 */
  deductionTotal: number;
  /** 売上 − 必要経費（青色申告特別控除の適用前） */
  netProfit: number;
  /** 支払調書と未突合の売上件数 */
  unverifiedCount: number;
  incomeCount: number;
  expenseCount: number;
  deductionCount: number;
};

export const buildSummary = (
  incomes: Income[],
  expenses: Expense[],
  deductions: Deduction[],
): TaxSummary => {
  let incomeTotal = 0;
  let withholdingTotal = 0;
  let unverifiedCount = 0;

  for (const income of incomes) {
    incomeTotal += income.amount ?? 0;
    withholdingTotal += income.tax_withheld ?? 0;
    if (!income.is_verified) unverifiedCount += 1;
  }

  // 減価償却の対象は決算書の「減価償却費」欄で別に計算するため、経費計には入れない
  let expenseTotal = 0;
  let assetTotal = 0;
  for (const expense of expenses) {
    if (isPlainExpense(expense)) expenseTotal += businessAmountOf(expense);
    else assetTotal += businessAmountOf(expense);
  }

  const deductionTotal = deductions.reduce((total, deduction) => total + (deduction.amount ?? 0), 0);

  return {
    incomeTotal,
    withholdingTotal,
    expenseTotal,
    assetTotal,
    deductionTotal,
    netProfit: incomeTotal - expenseTotal,
    unverifiedCount,
    incomeCount: incomes.length,
    expenseCount: expenses.length,
    deductionCount: deductions.length,
  };
};

/* ------------------------------------------------------------------ *
 * 売上：取引先別（確定申告書 第二表「所得の内訳」用）
 * ------------------------------------------------------------------ */

export type ClientIncome = {
  /** 支払者 × 種目 の複合キー（第二表はこの単位で1行になる） */
  rowKey: string;
  clientId: string;
  name: string;
  address: string | null;
  /** 第二表「所得の種類」 */
  incomeType: string;
  /** 第二表「種目」 */
  incomeCategory: string | null;
  amount: number;
  taxWithheld: number;
  count: number;
  unverifiedCount: number;
};

/**
 * 第二表「所得の内訳」の1行にあたる単位（支払者 × 種目）でまとめる。
 * 同じ取引先でも種目が違えば行を分ける必要があるため、種目をキーに含める。
 */
export const buildIncomeByClient = (incomes: Income[]): ClientIncome[] => {
  const totals = new Map<string, ClientIncome>();

  for (const income of incomes) {
    const clientId = income.client?.id ?? 'unknown';
    const incomeCategory = income.income_category?.trim() || null;
    const key = `${clientId}__${incomeCategory ?? ''}`;
    const current = totals.get(key) ?? {
      rowKey: key,
      clientId,
      name: income.client?.name ?? EMPTY_LABEL,
      address: income.client?.address ?? null,
      incomeType: income.client?.income_type?.[0] ?? '事業所得',
      incomeCategory,
      amount: 0,
      taxWithheld: 0,
      count: 0,
      unverifiedCount: 0,
    };

    current.amount += income.amount ?? 0;
    current.taxWithheld += income.tax_withheld ?? 0;
    current.count += 1;
    if (!income.is_verified) current.unverifiedCount += 1;

    totals.set(key, current);
  }

  return Array.from(totals.values()).sort((a, b) => b.amount - a.amount);
};

/** 支払調書との突合が済んでいない売上（古い順） */
export const buildUnverifiedIncomes = (incomes: Income[]): Income[] =>
  incomes.filter((income) => !income.is_verified);

/* ------------------------------------------------------------------ *
 * 経費：科目別（青色申告決算書 損益計算書用）
 * ------------------------------------------------------------------ */

export type CategoryExpense = {
  categoryId: string;
  name: string;
  /** 支払総額（家事分を含む） */
  amount: number;
  /** 必要経費算入額（＝申告に使う数字） */
  businessAmount: number;
  count: number;
  /** 按分した明細を含むか（100% 未満が1件でもあれば true） */
  hasProration: boolean;
  /** 決算書に印字済みの科目か。false なら決算書の空欄行に自分で科目名を書く */
  isStandard: boolean;
  /** categories.sort_order。未設定は null */
  sortOrder: number | null;
};

/**
 * 勘定科目ごとに年間合計をまとめる。減価償却の対象は「減価償却費」欄で別に扱うため除外する。
 *
 * 並びは決算書 損益計算書の印字順。categories.sort_order があればそれを使い、
 * 無ければ科目名を EXPENSE_CATEGORY_ORDER と突き合わせて推定する。
 * どちらでも決まらない科目（空欄行に書くもの）は末尾に金額の大きい順で並べる。
 */
export const buildExpenseByCategory = (expenses: Expense[]): CategoryExpense[] => {
  const totals = new Map<string, CategoryExpense>();
  const order = EXPENSE_CATEGORY_ORDER as readonly string[];

  for (const expense of expenses) {
    if (!isPlainExpense(expense)) continue;

    const key = expense.category?.id ?? 'unknown';
    const name = expense.category?.name ?? EMPTY_LABEL;
    const sortOrder = expense.category?.sort_order;
    const current = totals.get(key) ?? {
      categoryId: key,
      name,
      amount: 0,
      businessAmount: 0,
      count: 0,
      hasProration: false,
      isStandard: order.includes(name),
      sortOrder: typeof sortOrder === 'number' ? sortOrder : null,
    };

    current.amount += expense.amount ?? 0;
    current.businessAmount += businessAmountOf(expense);
    current.count += 1;
    if (businessRatioOf(expense) < 100) current.hasProration = true;

    totals.set(key, current);
  }

  // sort_order → 科目名の印字順 → 印字外、の順に並べる
  const rankOf = (row: CategoryExpense): number => {
    if (row.sortOrder !== null) return row.sortOrder;
    const index = order.indexOf(row.name);
    // sort_order を使う科目と混ざっても後ろに来るよう、十分大きい値を足す
    return index === -1 ? Number.POSITIVE_INFINITY : index + 1000;
  };

  return Array.from(totals.values()).sort((a, b) => {
    const rankA = rankOf(a);
    const rankB = rankOf(b);
    if (rankA === rankB) return b.businessAmount - a.businessAmount;
    return rankA - rankB;
  });
};

/** グラフ用の並べ替え。表は決算書順、グラフは金額順のほうが読みやすい */
export const sortByAmount = (categories: CategoryExpense[]): CategoryExpense[] =>
  [...categories].sort((a, b) => b.businessAmount - a.businessAmount);

/** グラフ用。上位以外は1本の「その他」にまとめる（バーが増えすぎると読めなくなるため） */
export const limitCategories = (
  categories: CategoryExpense[],
  limit = EXPENSE_CATEGORY_LIMIT,
): CategoryExpense[] => {
  if (categories.length <= limit) return categories;

  const rest = categories.slice(limit);
  return [
    ...categories.slice(0, limit),
    {
      categoryId: 'others',
      name: 'その他',
      amount: rest.reduce((total, item) => total + item.amount, 0),
      businessAmount: rest.reduce((total, item) => total + item.businessAmount, 0),
      count: rest.reduce((total, item) => total + item.count, 0),
      hasProration: rest.some((item) => item.hasProration),
      isStandard: false,
      sortOrder: null,
    },
  ];
};

/* ------------------------------------------------------------------ *
 * 所得控除：種別別
 * ------------------------------------------------------------------ */

/** 第二表で行を分ける保険料の区分ごとの小計 */
export type InsuranceBreakdown = {
  category: string;
  amount: number;
  count: number;
};

export type DeductionGroup = {
  type: string;
  amount: number;
  /** 保険金などで補填される金額の合計（医療費のみ） */
  compensatedAmount: number;
  /** amount − compensatedAmount。足切り前の金額 */
  netAmount: number;
  count: number;
  /** 区分の内訳（生命保険料・地震保険料のみ）。区分未設定の明細は '未設定' に入る */
  breakdown: InsuranceBreakdown[];
  /** 区分の入力が必要なのに未設定の件数 */
  missingCategoryCount: number;
  items: Deduction[];
};

/** 控除種別ごとにまとめる。申告書の並び順に従い、定義外の種別は末尾に回す */
export const buildDeductionByType = (deductions: Deduction[]): DeductionGroup[] => {
  const groups = new Map<string, DeductionGroup>();
  const categoryTotals = new Map<string, Map<string, InsuranceBreakdown>>();

  for (const deduction of deductions) {
    const type = selectOf(deduction.deduction_type);
    const current = groups.get(type) ?? {
      type,
      amount: 0,
      compensatedAmount: 0,
      netAmount: 0,
      count: 0,
      breakdown: [],
      missingCategoryCount: 0,
      items: [],
    };
    current.amount += deduction.amount ?? 0;
    // 補填額は医療費以外では使わないが、入力されていれば拾う
    current.compensatedAmount += deduction.compensated_amount ?? 0;
    current.count += 1;
    current.items.push(deduction);

    // 保険料の区分の内訳を作る
    const category = deduction.insurance_category?.[0];
    if (type === MEDICAL_DEDUCTION_TYPE) {
      // 医療費に保険料区分は無い
    } else if (category) {
      const perType = categoryTotals.get(type) ?? new Map<string, InsuranceBreakdown>();
      const row = perType.get(category) ?? { category, amount: 0, count: 0 };
      row.amount += deduction.amount ?? 0;
      row.count += 1;
      perType.set(category, row);
      categoryTotals.set(type, perType);
    }

    groups.set(type, current);
  }

  // 区分の内訳と、区分未設定の件数を確定させる
  const insuranceOrder = INSURANCE_CATEGORY_ORDER as readonly string[];
  for (const group of groups.values()) {
    group.netAmount = group.amount - group.compensatedAmount;
    const perType = categoryTotals.get(group.type);
    if (perType) {
      group.breakdown = Array.from(perType.values()).sort(
        (a, b) => insuranceOrder.indexOf(a.category) - insuranceOrder.indexOf(b.category),
      );
    }
    group.missingCategoryCount = group.items.filter(
      (item) => !item.insurance_category?.[0],
    ).length;
  }

  const order = DEDUCTION_TYPE_ORDER as readonly string[];
  return Array.from(groups.values()).sort((a, b) => {
    const indexA = order.indexOf(a.type);
    const indexB = order.indexOf(b.type);
    // 定義外（-1）は末尾へ。定義外どうしは金額の大きい順
    if (indexA === -1 && indexB === -1) return b.amount - a.amount;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
};

/* ------------------------------------------------------------------ *
 * 月別推移
 * ------------------------------------------------------------------ */

export type MonthlyPoint = {
  /** ソート用キー（YYYY-MM） */
  month: string;
  /** 軸ラベル（M月） */
  label: string;
  income: number;
  withheld: number;
  expense: number;
};

/** 対象年の1月〜12月を0埋めして返す（データが無い月も軸に出す） */
export const buildMonthlyTrend = (
  year: number,
  incomes: Income[],
  expenses: Expense[],
): MonthlyPoint[] => {
  const buckets = new Map<string, MonthlyPoint>();
  for (let month = 1; month <= 12; month += 1) {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    buckets.set(key, { month: key, label: `${month}月`, income: 0, withheld: 0, expense: 0 });
  }

  const keyOf = (date?: string) => (date ? jst(date).format('YYYY-MM') : null);

  for (const income of incomes) {
    const bucket = buckets.get(keyOf(income.date) ?? '');
    // 日付未入力・対象年外のレコードは軸に載せない
    if (!bucket) continue;
    bucket.income += income.amount ?? 0;
    bucket.withheld += income.tax_withheld ?? 0;
  }

  for (const expense of expenses) {
    const bucket = buckets.get(keyOf(expense.date) ?? '');
    if (!bucket) continue;
    // 月別の推移は決算書の「経費」欄と揃えるため、減価償却の対象は含めない
    if (!isPlainExpense(expense)) continue;
    bucket.expense += businessAmountOf(expense);
  }

  return Array.from(buckets.values());
};

/* ------------------------------------------------------------------ *
 * 消費税額（参考）：税率別の内訳
 * 課税事業者になった場合の試算用。免税事業者のうちは使わない。
 * ------------------------------------------------------------------ */

export type ConsumptionTaxBreakdown = {
  /** '10%' / '8%' / '未設定'（未設定は「対象外」か「未入力」かを区別できない） */
  rate: string;
  /** 税込金額の合計 */
  taxIncludedTotal: number;
  /** 内訳から算出した消費税額（参考）。明細ごとに1円未満切り捨てて合算 */
  taxAmount: number;
  /** taxIncludedTotal − taxAmount（参考） */
  netAmount: number;
  count: number;
};

/** 税込金額から消費税額を切り出す（税込 × 税率 ÷ (1 + 税率)、1円未満切り捨て） */
const taxPortionOf = (taxIncludedAmount: number, rate: string): number => {
  const decimal = TAX_RATE_DECIMAL[rate];
  if (decimal === undefined) return 0;
  return Math.floor((taxIncludedAmount * decimal) / (1 + decimal));
};

const RATE_ORDER = ['10%', '8%', TAX_RATE_UNSET_LABEL];

/** 並び順のランク。RATE_ORDER に無い値（将来 selectItems が増えた場合）は「未設定」の手前扱いにする */
const rateRankOf = (rate: string): number => {
  const index = RATE_ORDER.indexOf(rate);
  return index === -1 ? RATE_ORDER.length - 1 : index;
};

/**
 * 税率ごとに税込金額を集計し、参考の消費税額・税抜金額を添える。
 * amountOf は集計対象の金額（売上は amount、経費は事業割合を反映した businessAmountOf）を渡す。
 */
const buildConsumptionTaxBreakdown = <T>(
  items: T[],
  amountOf: (item: T) => number,
  rateOf: (item: T) => string[] | undefined,
): ConsumptionTaxBreakdown[] => {
  const totals = new Map<string, ConsumptionTaxBreakdown>();

  for (const item of items) {
    const rate = rateOf(item)?.[0] ?? TAX_RATE_UNSET_LABEL;
    const amount = amountOf(item);
    const current = totals.get(rate) ?? {
      rate,
      taxIncludedTotal: 0,
      taxAmount: 0,
      netAmount: 0,
      count: 0,
    };

    current.taxIncludedTotal += amount;
    current.taxAmount += taxPortionOf(amount, rate);
    current.count += 1;

    totals.set(rate, current);
  }

  for (const row of totals.values()) {
    row.netAmount = row.taxIncludedTotal - row.taxAmount;
  }

  return Array.from(totals.values()).sort(
    (a, b) => rateRankOf(a.rate) - rateRankOf(b.rate),
  );
};

/** 売上を税率別にまとめる（税込金額は income.amount そのまま） */
export const buildIncomeTaxBreakdown = (incomes: Income[]): ConsumptionTaxBreakdown[] =>
  buildConsumptionTaxBreakdown(
    incomes,
    (income) => income.amount ?? 0,
    (income) => income.tax_rate,
  );

/**
 * 経費を税率別にまとめる。
 * 事業割合を反映した額（businessAmountOf）を対象にする。仕入税額控除の対象は
 * 事業で使った分に限られるため。減価償却の対象（asset_type が「経費」以外）も、
 * 所得税の経費算入時期とは関係なく取得時に仕入税額控除の対象になるため含める。
 */
export const buildExpenseTaxBreakdown = (expenses: Expense[]): ConsumptionTaxBreakdown[] =>
  buildConsumptionTaxBreakdown(
    expenses,
    (expense) => businessAmountOf(expense),
    (expense) => expense.tax_rate,
  );

/* ------------------------------------------------------------------ *
 * 消費税の経過措置（2割特例／3割特例）：概算納付額（参考）
 * ------------------------------------------------------------------ */

export type ConsumptionTaxReliefEstimate = {
  relief: ConsumptionTaxRelief;
  /** 概算納付額（参考）。消費税の申告書は100円未満切り捨てが原則のため、ここでも切り捨てる */
  amount: number;
};

/**
 * 対象年に応じた経過措置（2割特例・3割特例）を判定し、概算納付額を返す。
 * 対象年が範囲外（2023〜2028年分以外）なら null（この画面には表示しない）。
 * taxAmount には売上に係る消費税額（参考）の合計（buildIncomeTaxBreakdown の taxAmount 合計）を渡す。
 */
export const estimateConsumptionTaxRelief = (
  taxAmount: number,
  year: number,
): ConsumptionTaxReliefEstimate | null => {
  const relief = CONSUMPTION_TAX_RELIEF_BY_YEAR[year];
  if (!relief) return null;
  return { relief, amount: Math.floor((taxAmount * relief.rate) / 100) * 100 };
};

/* ------------------------------------------------------------------ *
 * 少額減価償却資産の特例：年間300万円の上限チェック
 * ------------------------------------------------------------------ */

/**
 * 少額減価償却資産の特例（措法28の2）の対象額が年間上限（300万円）を超えていないか。
 * 超えている場合、どの資産を特例の対象にするかは任意に選べるため、対象を選び直す必要がある。
 */
export const findSmallSpecialOverLimit = (
  groups: AssetGroup[],
): { group: AssetGroup; overBy: number } | null => {
  const group = groups.find((item) => item.assetType === ASSET_TYPE_SMALL_SPECIAL);
  if (!group || group.businessAmount <= SMALL_SPECIAL_ANNUAL_LIMIT) return null;
  return { group, overBy: group.businessAmount - SMALL_SPECIAL_ANNUAL_LIMIT };
};

/* ------------------------------------------------------------------ *
 * 家事按分100%のリスク検知
 * ------------------------------------------------------------------ */

/**
 * 自宅兼事務所などで家事按分が必要になりやすい科目（地代家賃・水道光熱費・通信費）なのに、
 * 事業割合が100%かつ按分の根拠が未記入の明細。税務調査で問われやすい典型パターン。
 */
export const buildMixedUseRiskExpenses = (expenses: Expense[]): Expense[] => {
  const targets = MIXED_USE_PRONE_CATEGORIES as readonly string[];
  return expenses
    .filter((expense) => {
      const name = expense.category?.name;
      if (!name || !targets.includes(name)) return false;
      if (businessRatioOf(expense) < 100) return false;
      return !expense.ratio_basis?.trim();
    })
    .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));
};
