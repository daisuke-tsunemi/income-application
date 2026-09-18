// app/expenses/page.tsx
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Notice from '@/components/Notice';
import Coverage from '@/components/Notice/Coverage';
import AssetTypeAlert from '@/components/Notice/AssetTypeAlert';
import SmallSpecialLimitAlert from '@/components/Notice/SmallSpecialLimitAlert';
import MixedUseRiskAlert from '@/components/Notice/MixedUseRiskAlert';
import ChartCard from '@/components/Dashboard/ChartCard';
import StatTiles from '@/components/Dashboard/StatTiles';
import SummarySection from '@/components/Dashboard/SummarySection';
import YearFilter from '@/components/Dashboard/YearFilter';
import ExpenseBreakdownChart from '@/components/Dashboard/ExpenseBreakdownChart';
import { ExpenseBreakdownTable } from '@/components/Dashboard/ChartTables';
import TaxRateBreakdownTable from '@/components/Dashboard/TaxRateBreakdownTable';
import {
  AssetDetailTable,
  AssetGroupTable,
  ExpenseByCategoryTable,
  ExpenseDetailTable,
} from '@/components/ExpensesList';
import { getExpenses } from '@/libs/microcms';
import {
  buildAssetGroups,
  buildAssetTypeReviews,
  buildExpenseByCategory,
  buildExpenseTaxBreakdown,
  buildMixedUseRiskExpenses,
  buildSummary,
  findSmallSpecialOverLimit,
  isPlainExpense,
  limitCategories,
  sortByAmount,
} from '@/libs/analytics';
import { buildPeriod, defaultYear, yearOptions } from '@/libs/period';
import { UNCOVERED_ITEMS } from '@/constants';

export const revalidate = 300;

export const metadata: Metadata = {
  title: '経費・青色申告決算書',
};

type Props = {
  searchParams: Promise<{ year?: string }>;
};

export default async function Expenses({ searchParams }: Props) {
  const { year } = await searchParams;
  const period = buildPeriod(year);

  const { contents: expenses } = await getExpenses(period.filters);

  const summary = buildSummary([], expenses, []);
  // 表は決算書の印字順、グラフは金額順（用途が違うので並びを分ける）
  const byCategory = buildExpenseByCategory(expenses);
  const chartData = limitCategories(sortByAmount(byCategory));
  const proratedCount = byCategory.filter((row) => row.hasProration).length;
  const nonStandardCount = byCategory.filter((row) => !row.isStandard).length;

  // 経費欄に載せる明細と、減価償却費として別に扱う資産を分ける
  const plainExpenses = expenses.filter(isPlainExpense);
  const assets = expenses.filter((expense) => !isPlainExpense(expense));
  const assetGroups = buildAssetGroups(expenses);
  const reviews = buildAssetTypeReviews(expenses);
  const paidTotal = plainExpenses.reduce((total, expense) => total + (expense.amount ?? 0), 0);
  const taxBreakdown = buildExpenseTaxBreakdown(expenses);
  const taxBreakdownTotal = taxBreakdown.reduce((total, row) => total + row.taxAmount, 0);
  const smallSpecialOverLimit = findSmallSpecialOverLimit(assetGroups);
  const mixedUseRisks = buildMixedUseRiskExpenses(expenses);

  return (
    <>
      <Header title="経費・青色申告決算書の集計" />

      <YearFilter
        year={period.year}
        options={yearOptions()}
        defaultYear={defaultYear()}
        note={`経費 ${plainExpenses.length} 件／${byCategory.length} 科目／償却対象 ${assets.length} 件`}
      />

      <div className="u-mb24">
        <StatTiles
          tiles={[
            {
              label: '必要経費の合計',
              value: summary.expenseTotal.toLocaleString('ja-JP'),
              unit: '円',
              note: '決算書 損益計算書「経費計」へ転記（償却対象を除く）',
            },
            {
              label: '支払総額（経費分）',
              value: paidTotal.toLocaleString('ja-JP'),
              unit: '円',
              note: '家事分を含む実際の支出額',
            },
            {
              label: '家事分（経費外）',
              value: (paidTotal - summary.expenseTotal).toLocaleString('ja-JP'),
              unit: '円',
              note: '事業割合で按分して除外した金額',
            },
            {
              label: '減価償却の対象',
              value: summary.assetTotal.toLocaleString('ja-JP'),
              unit: '円',
              note: `取得価額の合計 ${assets.length} 件。当年の償却額は決算書3ページ目で計算`,
              alert: reviews.length > 0,
            },
          ]}
        />
      </div>

      {reviews.length > 0 && (
        <div className="u-mb24">
          <AssetTypeAlert expenses={reviews} />
        </div>
      )}

      {mixedUseRisks.length > 0 && (
        <div className="u-mb24">
          <MixedUseRiskAlert expenses={mixedUseRisks} />
        </div>
      )}

      <div className="u-mb24">
        <ChartCard
          title="勘定科目別の必要経費"
          note={`${period.label}／金額の大きい順。上位10科目以外は「その他」にまとめる`}
          table={<ExpenseBreakdownTable data={chartData} />}
        >
          <ExpenseBreakdownChart data={chartData} />
        </ChartCard>
      </div>

      <SummarySection
        title="勘定科目別の年間合計"
        note={`決算書1ページ目 損益計算書へ上から順に転記／空欄行に記入 ${nonStandardCount} 科目・按分あり ${proratedCount} 科目`}
        total={{ label: '必要経費算入額の合計', value: summary.expenseTotal }}
      >
        <ExpenseByCategoryTable rows={byCategory} />
      </SummarySection>

      {assetGroups.length > 0 && (
        <>
          <SummarySection
            title="減価償却の対象"
            note="決算書「減価償却費」欄／3ページ目「減価償却費の計算」へ"
            total={{ label: '取得価額の合計（事業分）', value: summary.assetTotal }}
          >
            <AssetGroupTable rows={assetGroups} />
          </SummarySection>

          {smallSpecialOverLimit && (
            <div className="u-mt16 u-mb24">
              <SmallSpecialLimitAlert overLimit={smallSpecialOverLimit} />
            </div>
          )}

          <SummarySection title="資産の明細" note={`${period.label}／取得日の古い順`}>
            <AssetDetailTable rows={assets} />
          </SummarySection>
        </>
      )}

      <SummarySection
        title="税率別の内訳（消費税・参考）"
        note="事業割合を反映した金額を集計。本則課税で仕入税額控除を計算する場合の試算用（2割特例・3割特例では使いません）"
        total={{ label: '消費税額の合計（参考）', value: taxBreakdownTotal }}
      >
        <TaxRateBreakdownTable data={taxBreakdown} />
      </SummarySection>

      <SummarySection
        title="経費の明細"
        note={`${period.label}／支払日の古い順`}
        total={{ label: '必要経費算入額の合計', value: summary.expenseTotal }}
      >
        <ExpenseDetailTable rows={expenses} />
      </SummarySection>

      <div className="u-mt40">
        <Coverage items={UNCOVERED_ITEMS.expenses} />
      </div>

      <div className="u-mt16">
        <Notice>
          勘定科目ごとの「必要経費算入額」は
          <strong>支払総額 × 事業割合（business_ratio ÷ 100）</strong>
          で算出しています。決算書の損益計算書に載せるのはこの金額で、家事按分した差額は経費になりません。
          科目は<strong>決算書の印字順</strong>に並べているので、上から順に転記できます。
          経費区分が「経費（10万円未満）」以外の明細は<strong>経費計に含めず</strong>、
          「減価償却の対象」に分けています。「税率別の内訳」の消費税額はあくまで参考値です。
          2割特例・3割特例を使う場合はこのページの消費税額を使わず、
          「売上・源泉徴収」ページの概算納付額だけで計算できます。
        </Notice>
      </div>
    </>
  );
}
