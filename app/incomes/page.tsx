// app/incomes/page.tsx
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Notice from '@/components/Notice';
import Coverage from '@/components/Notice/Coverage';
import UnverifiedAlert from '@/components/Notice/UnverifiedAlert';
import StatTiles from '@/components/Dashboard/StatTiles';
import SummarySection from '@/components/Dashboard/SummarySection';
import MonthlySalesTable from '@/components/Dashboard/MonthlySalesTable';
import YearFilter from '@/components/Dashboard/YearFilter';
import { IncomeByClientTable, IncomeDetailTable } from '@/components/IncomesList';
import { getIncomes } from '@/libs/microcms';
import {
  buildIncomeByClient,
  buildMonthlyTrend,
  buildSummary,
  buildUnverifiedIncomes,
} from '@/libs/analytics';
import { buildPeriod, defaultYear, yearOptions } from '@/libs/period';
import { UNCOVERED_ITEMS } from '@/constants';

export const revalidate = 300;

export const metadata: Metadata = {
  title: '売上・源泉徴収',
};

type Props = {
  searchParams: Promise<{ year?: string }>;
};

export default async function Incomes({ searchParams }: Props) {
  const { year } = await searchParams;
  const period = buildPeriod(year);

  const { contents: incomes } = await getIncomes(period.filters);

  const summary = buildSummary(incomes, [], []);
  const byClient = buildIncomeByClient(incomes);
  const unverified = buildUnverifiedIncomes(incomes);
  const monthly = buildMonthlyTrend(period.year, incomes, []);

  return (
    <>
      <Header title="売上・源泉徴収の集計" />

      <YearFilter
        year={period.year}
        options={yearOptions()}
        defaultYear={defaultYear()}
        note={`売上 ${summary.incomeCount} 件／取引先 ${byClient.length} 社`}
      />

      <div className="u-mb24">
        <StatTiles
          tiles={[
            {
              label: '収入金額の合計',
              value: summary.incomeTotal.toLocaleString('ja-JP'),
              unit: '円',
              note: '決算書 損益計算書「売上（収入）金額」',
            },
            {
              label: '源泉徴収税額の合計',
              value: summary.withholdingTotal.toLocaleString('ja-JP'),
              unit: '円',
              note: '第二表「所得の内訳」の合計欄',
            },
            {
              label: '支払調書と未突合',
              value: summary.unverifiedCount.toLocaleString('ja-JP'),
              unit: '件',
              note: '源泉徴収税額の確定に必要',
              alert: summary.unverifiedCount > 0,
            },
          ]}
        />
      </div>

      <div className="u-mb24">
        <UnverifiedAlert incomes={unverified} />
      </div>

      <SummarySection
        title="取引先（支払者）別の年間合計"
        note="申告書 第二表「所得の内訳」へ転記（支払者 × 種目 ＝ 1行）"
        total={{ label: '源泉徴収税額の合計', value: summary.withholdingTotal }}
      >
        <IncomeByClientTable rows={byClient} />
      </SummarySection>

      <SummarySection
        title="月別の売上（収入）金額"
        note="決算書2ページ目「月別売上（収入）金額及び仕入金額」へ転記"
        total={{ label: '売上（収入）金額の合計', value: summary.incomeTotal }}
      >
        <MonthlySalesTable data={monthly} />
      </SummarySection>

      <SummarySection
        title="売上の明細"
        note={`${period.label}／計上日の古い順`}
        total={{ label: '収入金額の合計', value: summary.incomeTotal }}
      >
        <IncomeDetailTable rows={incomes} />
      </SummarySection>

      <div className="u-mt40">
        <Coverage items={UNCOVERED_ITEMS.income} />
      </div>

      <div className="u-mt16">
        <Notice>
          このページの取引先別の合計は、確定申告書 第二表「所得の内訳（所得税及び復興特別所得税の源泉徴収税額）」
          にそのまま転記できる単位でまとめています。入金の有無にかかわらず、
          <strong>発生日を基準に計上済みとして合計に含めています</strong>（入金日は参考情報です）。
        </Notice>
      </div>
    </>
  );
}
