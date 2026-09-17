import Header from '@/components/Header';
import Notice from '@/components/Notice';
import Coverage from '@/components/Notice/Coverage';
import UnverifiedAlert from '@/components/Notice/UnverifiedAlert';
import ChartCard from '@/components/Dashboard/ChartCard';
import YearFilter from '@/components/Dashboard/YearFilter';
import StatTiles from '@/components/Dashboard/StatTiles';
import IncomeTrendChart from '@/components/Dashboard/IncomeTrendChart';
import ExpenseBreakdownChart from '@/components/Dashboard/ExpenseBreakdownChart';
import {
  ExpenseBreakdownTable,
  MonthlyTrendTable,
} from '@/components/Dashboard/ChartTables';
import { getDeductions, getExpenses, getIncomes } from '@/libs/microcms';
import {
  buildExpenseByCategory,
  buildMonthlyTrend,
  buildSummary,
  buildUnverifiedIncomes,
  limitCategories,
  sortByAmount,
} from '@/libs/analytics';
import { buildPeriod, defaultYear, yearOptions } from '@/libs/period';
import { UNCOVERED_ITEMS } from '@/constants';
import styles from '@/components/Dashboard/dashboard.module.scss';

// 対象年ごとの集計結果を5分間キャッシュする
export const revalidate = 300;

type Props = {
  searchParams: Promise<{ year?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const { year } = await searchParams;
  const period = buildPeriod(year);

  // 3 API を同じ期間で並列取得する（KPI・グラフ・アラートがすべて同じスライスになる）
  const [{ contents: incomes }, { contents: expenses }, { contents: deductions }] =
    await Promise.all([
      getIncomes(period.filters),
      getExpenses(period.filters),
      getDeductions(period.filters),
    ]);

  const summary = buildSummary(incomes, expenses, deductions);
  const monthly = buildMonthlyTrend(period.year, incomes, expenses);
  // グラフは金額の大きい順（表と違い、並びで量を読ませる）
  const categories = limitCategories(sortByAmount(buildExpenseByCategory(expenses)));
  const unverified = buildUnverifiedIncomes(incomes);

  return (
    <>
      <Header title="確定申告ダッシュボード" />

      <YearFilter
        year={period.year}
        options={yearOptions()}
        defaultYear={defaultYear()}
        note={`売上 ${summary.incomeCount} 件／経費 ${summary.expenseCount} 件／控除 ${summary.deductionCount} 件`}
      />

      <div className="u-mb8">
        <StatTiles
          tiles={[
            {
              label: '売上（収入金額）',
              value: summary.incomeTotal.toLocaleString('ja-JP'),
              unit: '円',
              note: '決算書 損益計算書「売上（収入）金額」',
            },
            {
              label: '源泉徴収税額',
              value: summary.withholdingTotal.toLocaleString('ja-JP'),
              unit: '円',
              note: '申告書 第二表「所得の内訳」の合計',
            },
            {
              label: '必要経費',
              value: summary.expenseTotal.toLocaleString('ja-JP'),
              unit: '円',
              note: '事業割合を反映した算入額（減価償却の対象を除く）',
            },
            {
              label: '所得控除',
              value: summary.deductionTotal.toLocaleString('ja-JP'),
              unit: '円',
              note: '申告書 第一表「所得から差し引かれる金額」',
            },
          ]}
        />
      </div>

      <div className="u-mb8">
        <StatTiles
          tiles={[
            {
              label: '青色申告特別控除前の所得金額',
              value: summary.netProfit.toLocaleString('ja-JP'),
              unit: '円',
              note:
                summary.assetTotal > 0
                  ? `売上 − 必要経費。減価償却の対象 ${summary.assetTotal.toLocaleString('ja-JP')} 円分はまだ引いていない`
                  : '売上 − 必要経費。売上原価・引当金がある場合は別途調整が必要',
              alert: summary.assetTotal > 0,
            },
            {
              label: '支払調書と未突合',
              value: summary.unverifiedCount.toLocaleString('ja-JP'),
              unit: '件',
              note: '源泉徴収税額の確定に必要',
              alert: summary.unverifiedCount > 0,
            },
            {
              label: '登録件数',
              value: (
                summary.incomeCount +
                summary.expenseCount +
                summary.deductionCount
              ).toLocaleString('ja-JP'),
              unit: '件',
              note: `${period.label}に計上された全レコード`,
            },
          ]}
        />
      </div>

      <div className="u-mb24">
        <UnverifiedAlert incomes={unverified} href="/incomes" />
      </div>

      <div className={styles.grid}>
        <div className={styles.grid__wide}>
          <ChartCard
            title="月別の売上・必要経費・源泉徴収税額"
            note={`${period.label}／計上日で集計`}
            table={<MonthlyTrendTable data={monthly} />}
          >
            <IncomeTrendChart data={monthly} />
          </ChartCard>
        </div>

        <div className={styles.grid__wide}>
          <ChartCard
            title="勘定科目別の必要経費"
            note="事業割合を反映した算入額。上位10科目以外は「その他」にまとめる"
            table={<ExpenseBreakdownTable data={categories} />}
          >
            <ExpenseBreakdownChart data={categories} />
          </ChartCard>
        </div>
      </div>

      <div className="u-mt40">
        <Coverage items={UNCOVERED_ITEMS.overall} />
      </div>

      <div className="u-mt16">
        <Notice />
      </div>
    </>
  );
}
