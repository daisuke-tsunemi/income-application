import Header from '@/components/Header';
import ChartCard from '@/components/Dashboard/ChartCard';
import PeriodFilter from '@/components/Dashboard/PeriodFilter';
import StatTiles from '@/components/Dashboard/StatTiles';
import SalesTrendChart from '@/components/Dashboard/SalesTrendChart';
import StatusBreakdownChart from '@/components/Dashboard/StatusBreakdownChart';
import EmployeeSalesChart from '@/components/Dashboard/EmployeeSalesChart';
import {
  EmployeeSalesTable,
  MonthlyTrendTable,
  StatusBreakdownTable,
} from '@/components/Dashboard/ChartTables';
import { getAllContents } from '@/libs/microcms';
import {
  buildEmployeeSales,
  buildMonthlyTrend,
  buildStatusBreakdown,
  buildSummary,
} from '@/libs/analytics';
import { buildPeriod, defaultStartMonth } from '@/libs/period';
import type { Deal } from '@/libs/types';
import {
  DASHBOARD_EMPLOYEE_LIMIT,
  DASHBOARD_MONTHS,
  DEALS_ANALYTICS_FIELDS,
} from '@/constants';
import styles from '@/components/Dashboard/dashboard.module.scss';

// 起点月ごとの集計結果を5分間キャッシュする
export const revalidate = 300;

type Props = {
  searchParams: Promise<{ from?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const { from } = await searchParams;
  const period = buildPeriod(from, DASHBOARD_MONTHS);

  // 期間で API 側を絞るので、KPI・各チャート・テーブルがすべて同じスライスになる
  const { contents: deals, totalCount, truncated } = await getAllContents<Deal>('deals', {
    fields: DEALS_ANALYTICS_FIELDS,
    filters: period.filters,
    orders: '-publishedAt',
  });

  const summary = buildSummary(deals);
  const monthly = buildMonthlyTrend(deals, period.start, DASHBOARD_MONTHS);
  const statuses = buildStatusBreakdown(deals);
  const employees = buildEmployeeSales(deals, DASHBOARD_EMPLOYEE_LIMIT);

  return (
    <>
      <Header title="ダッシュボード" />

      <PeriodFilter
        startValue={period.startValue}
        label={period.label}
        defaultValue={defaultStartMonth()}
      />

      {truncated && (
        <p className={`${styles.notice} u-mb24`}>
          対象期間の商談 {totalCount.toLocaleString('ja-JP')} 件のうち、
          {deals.length.toLocaleString('ja-JP')} 件を集計しています。
        </p>
      )}

      <div className="u-mb24">
        <StatTiles summary={summary} />
      </div>

      <div className={styles.grid}>
        <div className={styles.grid__wide}>
          <ChartCard
            title="月別 売上・見込み金額の推移"
            note={`${period.label}／商談の公開日で集計`}
            table={<MonthlyTrendTable data={monthly} />}
          >
            <SalesTrendChart data={monthly} />
          </ChartCard>
        </div>

        <ChartCard
          title="ステータス別 商談数"
          note="色の濃さがパイプラインの進行度を表す"
          table={<StatusBreakdownTable data={statuses} />}
        >
          <StatusBreakdownChart data={statuses} />
        </ChartCard>

        <ChartCard
          title="担当者別 売上金額"
          note="複数担当の案件は各担当に満額を計上（合計は売上金額と一致しない）"
          table={<EmployeeSalesTable data={employees} />}
        >
          <EmployeeSalesChart data={employees} />
        </ChartCard>
      </div>
    </>
  );
}
