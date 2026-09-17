import DataTable, { type Column } from '@/components/List/DataTable';
import { formatAmount } from '@/libs/format';
import type { MonthlyPoint } from '@/libs/analytics';

type Props = {
  data: MonthlyPoint[];
};

const columns: Column<MonthlyPoint>[] = [
  { header: '月', cell: (point) => <strong className="c-heading--sm">{point.label}</strong> },
  {
    header: '売上（収入）金額（円）',
    align: 'right',
    cell: (point) =>
      point.income > 0 ? (
        <strong>{formatAmount(point.income)}</strong>
      ) : (
        <span className="color__70">0</span>
      ),
  },
  {
    // 決算書には仕入金額の列もあるが、本システムは仕入・棚卸を扱わないため参考値を置く
    header: '必要経費（参考・円）',
    align: 'right',
    cell: (point) =>
      point.expense > 0 ? formatAmount(point.expense) : <span className="color__70">0</span>,
  },
];

/**
 * 青色申告決算書 2ページ目「月別売上（収入）金額及び仕入金額」への転記用。
 * 決算書の必須記入欄なので、グラフの補助ではなく独立した表として出す。
 */
export default function MonthlySalesTable({ data }: Props) {
  return <DataTable columns={columns} rows={data} getKey={(point) => point.month} />;
}
