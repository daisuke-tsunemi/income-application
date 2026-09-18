import Badge from '@/components/Badge';
import DataTable, { type Column } from '@/components/List/DataTable';
import { formatAmount } from '@/libs/format';
import type { ConsumptionTaxBreakdown } from '@/libs/analytics';
import { TAX_RATE_UNSET_LABEL } from '@/constants';

const columns: Column<ConsumptionTaxBreakdown>[] = [
  {
    header: '税率',
    cell: (row) =>
      row.rate === TAX_RATE_UNSET_LABEL ? (
        <Badge tone="todo">{row.rate}</Badge>
      ) : (
        <strong className="c-heading--sm">{row.rate}</strong>
      ),
  },
  {
    header: '件数',
    align: 'right',
    cell: (row) => <>{row.count.toLocaleString('ja-JP')}</>,
  },
  {
    header: '税込金額（円）',
    align: 'right',
    cell: (row) => <strong>{formatAmount(row.taxIncludedTotal)}</strong>,
  },
  {
    header: '消費税額（参考・円）',
    align: 'right',
    cell: (row) =>
      row.rate === TAX_RATE_UNSET_LABEL ? (
        <span className="color__70">—</span>
      ) : (
        formatAmount(row.taxAmount)
      ),
  },
  {
    header: '税抜金額（参考・円）',
    align: 'right',
    cell: (row) =>
      row.rate === TAX_RATE_UNSET_LABEL ? (
        <span className="color__70">{formatAmount(row.netAmount)}</span>
      ) : (
        formatAmount(row.netAmount)
      ),
  },
];

/**
 * 税率（tax_rate）別の内訳。課税事業者になった場合の消費税額試算の参考値で、
 * 免税事業者のうちは使わない。「未設定」は「対象外」なのか「未入力」なのか
 * 区別できないため、件数が多い場合は入力を見直すよう促す。
 */
export default function TaxRateBreakdownTable({ data }: { data: ConsumptionTaxBreakdown[] }) {
  return (
    <DataTable
      columns={columns}
      rows={data}
      getKey={(row) => row.rate}
      emptyMessage="対象年のデータがありません。"
    />
  );
}
