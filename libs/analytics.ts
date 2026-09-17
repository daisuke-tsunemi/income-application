import type { Dayjs } from 'dayjs';
import { jst } from './datetime';
import type { Deal } from './types';
import { DEAL_STATUS_ORDER, DEAL_WON_STATUS } from '@/constants';

export type MonthlyPoint = {
  /** ソート用キー（YYYY-MM） */
  month: string;
  /** 軸ラベル（YY/MM） */
  label: string;
  sales: number;
  estimated: number;
};

export type StatusPoint = {
  status: string;
  count: number;
  /** DEAL_STATUS_ORDER に含まれる（＝順序ランプで着色する）か */
  inPipeline: boolean;
};

export type EmployeePoint = {
  name: string;
  sales: number;
  count: number;
};

export type DashboardSummary = {
  dealCount: number;
  estimatedTotal: number;
  salesTotal: number;
  wonCount: number;
  /** 受注率（%）。商談が0件なら null */
  wonRate: number | null;
};

/** microCMS の select は配列で返るため、パイプライン段階は先頭の値を採用する */
const statusOf = (deal: Deal): string => deal.status?.[0] ?? '未設定';

export const buildSummary = (deals: Deal[]): DashboardSummary => {
  let estimatedTotal = 0;
  let salesTotal = 0;
  let wonCount = 0;

  for (const deal of deals) {
    estimatedTotal += deal.estimated ?? 0;
    salesTotal += deal.sales ?? 0;
    if (statusOf(deal) === DEAL_WON_STATUS) wonCount += 1;
  }

  return {
    dealCount: deals.length,
    estimatedTotal,
    salesTotal,
    wonCount,
    wonRate: deals.length > 0 ? (wonCount / deals.length) * 100 : null,
  };
};

/** 起点月から months ヶ月分を0埋めして返す（データが無い月も軸に出す） */
export const buildMonthlyTrend = (
  deals: Deal[],
  start: Dayjs,
  months: number,
): MonthlyPoint[] => {
  const buckets = new Map<string, MonthlyPoint>();
  for (let index = 0; index < months; index += 1) {
    const month = start.add(index, 'month');
    const key = month.format('YYYY-MM');
    buckets.set(key, { month: key, label: month.format('YY/MM'), sales: 0, estimated: 0 });
  }

  for (const deal of deals) {
    if (!deal.publishedAt) continue;
    const bucket = buckets.get(jst(deal.publishedAt).format('YYYY-MM'));
    // 集計期間より古い商談は対象外
    if (!bucket) continue;
    bucket.sales += deal.sales ?? 0;
    bucket.estimated += deal.estimated ?? 0;
  }

  return Array.from(buckets.values());
};

/** パイプライン順に並べ、定義外のステータスは末尾にまとめる */
export const buildStatusBreakdown = (deals: Deal[]): StatusPoint[] => {
  const counts = new Map<string, number>();
  for (const status of DEAL_STATUS_ORDER) counts.set(status, 0);

  for (const deal of deals) {
    const status = statusOf(deal);
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  const known = DEAL_STATUS_ORDER.map((status) => ({
    status,
    count: counts.get(status) ?? 0,
    inPipeline: true,
  }));

  const unknown = Array.from(counts.entries())
    .filter(([status]) => !DEAL_STATUS_ORDER.includes(status as (typeof DEAL_STATUS_ORDER)[number]))
    .map(([status, count]) => ({ status, count, inPipeline: false }))
    .sort((a, b) => b.count - a.count);

  return [...known, ...unknown];
};

/**
 * 担当者別の売上。複数担当の案件は各担当に満額を計上するため、
 * 合計は salesTotal と一致しない点に注意。
 */
export const buildEmployeeSales = (deals: Deal[], limit: number): EmployeePoint[] => {
  const totals = new Map<string, EmployeePoint>();

  for (const deal of deals) {
    for (const employee of deal.employee ?? []) {
      const current = totals.get(employee.id) ?? { name: employee.name, sales: 0, count: 0 };
      current.sales += deal.sales ?? 0;
      current.count += 1;
      totals.set(employee.id, current);
    }
  }

  const sorted = Array.from(totals.values()).sort((a, b) => b.sales - a.sales || b.count - a.count);
  if (sorted.length <= limit) return sorted;

  // 上位以外は1本の「その他」にまとめる（バーが増えすぎると読めなくなるため）
  const rest = sorted.slice(limit);
  return [
    ...sorted.slice(0, limit),
    {
      name: 'その他',
      sales: rest.reduce((total, item) => total + item.sales, 0),
      count: rest.reduce((total, item) => total + item.count, 0),
    },
  ];
};
