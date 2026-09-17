import Badge from '@/components/Badge';
import DataTable, { type Column } from '@/components/List/DataTable';
import { EMPTY_LABEL, formatAmount, formatDate } from '@/libs/format';
import type { ClientIncome } from '@/libs/analytics';
import type { Income } from '@/libs/types';

/* ------------------------------------------------------------------ *
 * 取引先別の集計（確定申告書 第二表「所得の内訳」へ転記する単位）
 * ------------------------------------------------------------------ */

const clientColumns: Column<ClientIncome>[] = [
  {
    header: '所得の種類',
    cell: (row) => <span className="c-txt__sm color__70">{row.incomeType}</span>,
  },
  {
    header: '種目',
    cell: (row) =>
      row.incomeCategory ? (
        <strong className="c-heading--sm">{row.incomeCategory}</strong>
      ) : (
        <Badge tone="todo">未設定</Badge>
      ),
  },
  {
    // 第二表は「名称」と「所在地等」で1欄なのでまとめて出す。
    // 登録番号は第二表には無いが、インボイスの確認用に添える
    header: '支払者の名称・所在地等',
    cell: (row) => (
      <>
        <strong className="c-heading--sm">{row.name}</strong>
        {row.address && <p className="c-txt__min">{row.address}</p>}
      </>
    ),
  },
  {
    header: '件数',
    align: 'right',
    cell: (row) => <>{row.count.toLocaleString('ja-JP')}</>,
  },
  {
    header: '収入金額（円）',
    align: 'right',
    cell: (row) => <strong>{formatAmount(row.amount)}</strong>,
  },
  {
    header: '源泉徴収税額（円）',
    align: 'right',
    cell: (row) =>
      row.taxWithheld > 0 ? (
        <strong>{formatAmount(row.taxWithheld)}</strong>
      ) : (
        <span className="color__70">0</span>
      ),
  },
  {
    header: '支払調書との突合',
    cell: (row) =>
      row.unverifiedCount > 0 ? (
        <Badge tone="todo">未確認 {row.unverifiedCount} 件</Badge>
      ) : (
        <Badge tone="done">確認済</Badge>
      ),
  },
];

export function IncomeByClientTable({ rows }: { rows: ClientIncome[] }) {
  return (
    <DataTable
      columns={clientColumns}
      rows={rows}
      getKey={(row) => row.rowKey}
      emptyMessage="対象年の売上が登録されていません。"
    />
  );
}

/* ------------------------------------------------------------------ *
 * 売上明細
 * ------------------------------------------------------------------ */

const detailColumns: Column<Income>[] = [
  {
    header: '計上日',
    cell: (income) =>
      formatDate(income.date) ? (
        <time className="c-txt__sm">{formatDate(income.date)}</time>
      ) : (
        <span className="color__70 c-txt__sm">{EMPTY_LABEL}</span>
      ),
  },
  {
    header: '取引先',
    cell: (income) => (
      <strong className="c-heading--sm">{income.client?.name ?? EMPTY_LABEL}</strong>
    ),
  },
  {
    header: '種目',
    cell: (income) =>
      income.income_category ? (
        <span className="c-txt__sm">{income.income_category}</span>
      ) : (
        <span className="color__70 c-txt__sm">{EMPTY_LABEL}</span>
      ),
  },
  {
    header: '収入金額（円）',
    align: 'right',
    cell: (income) => <strong>{formatAmount(income.amount)}</strong>,
  },
  {
    header: '源泉徴収税額（円）',
    align: 'right',
    cell: (income) =>
      (income.tax_withheld ?? 0) > 0 ? (
        formatAmount(income.tax_withheld)
      ) : (
        <span className="color__70">0</span>
      ),
  },
  {
    header: '入金日',
    cell: (income) =>
      formatDate(income.paid_date) ? (
        <time className="c-txt__sm">{formatDate(income.paid_date)}</time>
      ) : (
        <span className="color__70 c-txt__sm">{EMPTY_LABEL}</span>
      ),
  },
  {
    header: '突合',
    cell: (income) =>
      income.is_verified ? <Badge tone="done">確認済</Badge> : <Badge tone="todo">未確認</Badge>,
  },
  {
    header: '備考',
    cell: (income) =>
      income.memo ? <p className="c-txt__sm">{income.memo}</p> : <span className="color__70">—</span>,
  },
];

export function IncomeDetailTable({ rows }: { rows: Income[] }) {
  return (
    <DataTable
      columns={detailColumns}
      rows={rows}
      getKey={(income) => income.id}
      emptyMessage="対象年の売上が登録されていません。"
      scrollable
    />
  );
}
