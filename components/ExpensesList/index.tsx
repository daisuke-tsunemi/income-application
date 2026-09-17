import Badge from '@/components/Badge';
import DataTable, { type Column } from '@/components/List/DataTable';
import Thumbnail from '@/components/List/Thumbnail';
import {
  assetTypeOf,
  businessAmountOf,
  businessRatioOf,
  isPlainExpense,
  needsAssetTypeReview,
  type AssetGroup,
  type CategoryExpense,
} from '@/libs/analytics';
import { ASSET_TYPE_GUIDE } from '@/constants';
import { EMPTY_LABEL, formatAmount, formatDate, formatRatio } from '@/libs/format';
import type { Expense } from '@/libs/types';
import styles from '@/components/List/list.module.scss';

/* ------------------------------------------------------------------ *
 * 勘定科目別の集計（青色申告決算書 損益計算書へ転記する単位）
 * ------------------------------------------------------------------ */

const categoryColumns: Column<CategoryExpense>[] = [
  {
    header: '勘定科目',
    cell: (row) => (
      <div className="u-align wrap u-gap4">
        <strong className="c-heading--sm">{row.name}</strong>
        {row.hasProration && <Badge tone="note">按分あり</Badge>}
        {/* 決算書に印字されていない科目は、空欄行に自分で科目名を書く必要がある */}
        {!row.isStandard && <Badge tone="plain">空欄行に記入</Badge>}
      </div>
    ),
  },
  {
    header: '件数',
    align: 'right',
    cell: (row) => <>{row.count.toLocaleString('ja-JP')}</>,
  },
  {
    header: '支払総額（円）',
    align: 'right',
    cell: (row) => <>{formatAmount(row.amount)}</>,
  },
  {
    header: '家事分（円）',
    align: 'right',
    cell: (row) => {
      const personal = row.amount - row.businessAmount;
      return personal > 0 ? (
        <>{formatAmount(personal)}</>
      ) : (
        <span className="color__70">0</span>
      );
    },
  },
  {
    // 申告書に載せるのはこの列
    header: '必要経費算入額（円）',
    align: 'right',
    cell: (row) => <strong>{formatAmount(row.businessAmount)}</strong>,
  },
];

export function ExpenseByCategoryTable({ rows }: { rows: CategoryExpense[] }) {
  return (
    <DataTable
      columns={categoryColumns}
      rows={rows}
      getKey={(row) => row.categoryId}
      emptyMessage="対象年の経費が登録されていません。"
    />
  );
}

/* ------------------------------------------------------------------ *
 * 経費明細
 * ------------------------------------------------------------------ */

function Receipts({ expense }: { expense: Expense }) {
  const images = expense.receipt_images ?? [];
  if (images.length === 0) return <span className="color__70">—</span>;

  return (
    <div className={styles.receipts}>
      {images.map((image, index) => (
        <a
          key={image.url}
          href={image.url}
          target="_blank"
          rel="noopener noreferrer"
          title={`領収書 ${index + 1} を開く`}
        >
          <Thumbnail image={image} alt={`領収書 ${index + 1}`} />
        </a>
      ))}
    </div>
  );
}

const detailColumns: Column<Expense>[] = [
  {
    header: '支払日',
    cell: (expense) =>
      formatDate(expense.date) ? (
        <time className="c-txt__sm">{formatDate(expense.date)}</time>
      ) : (
        <span className="color__70 c-txt__sm">{EMPTY_LABEL}</span>
      ),
  },
  {
    header: '勘定科目',
    cell: (expense) => (
      <strong className="c-heading--sm">{expense.category?.name ?? EMPTY_LABEL}</strong>
    ),
  },
  {
    header: '支払先',
    cell: (expense) =>
      expense.payee ? (
        <>
          {expense.payee}
          {/* 課税事業者になった場合の仕入税額控除の確認用。現状は集計に使わない参考情報 */}
          {expense.invoice_number && <p className="c-txt__min">登録番号 {expense.invoice_number}</p>}
        </>
      ) : (
        <span className="color__70">{EMPTY_LABEL}</span>
      ),
  },
  {
    header: '支払方法',
    cell: (expense) => {
      const method = expense.payment_method?.[0];
      return method ? (
        <Badge tone="plain">{method}</Badge>
      ) : (
        <span className="color__70">{EMPTY_LABEL}</span>
      );
    },
  },
  {
    header: '経費区分',
    cell: (expense) => {
      // 10万円以上なのに「経費」のままなら、区分の設定漏れの可能性が高い
      if (needsAssetTypeReview(expense)) return <Badge tone="todo">区分の確認が必要</Badge>;
      if (isPlainExpense(expense)) return <span className="color__70 c-txt__xs">経費</span>;
      return <Badge tone="note">{assetTypeOf(expense)}</Badge>;
    },
  },
  {
    header: '支払総額（円）',
    align: 'right',
    cell: (expense) => <>{formatAmount(expense.amount)}</>,
  },
  {
    header: '事業割合',
    align: 'right',
    cell: (expense) => {
      const ratio = businessRatioOf(expense);
      return (
        <>
          {ratio < 100 ? (
            <Badge tone="note">{formatRatio(ratio)}</Badge>
          ) : (
            <span className="color__70">{formatRatio(ratio)}</span>
          )}
          {expense.ratio_basis && <p className="c-txt__min">{expense.ratio_basis}</p>}
        </>
      );
    },
  },
  {
    header: '必要経費算入額（円）',
    align: 'right',
    cell: (expense) =>
      isPlainExpense(expense) ? (
        <strong>{formatAmount(businessAmountOf(expense))}</strong>
      ) : (
        // 償却資産は当年の算入額が別計算になるため、ここでは金額を出さない
        <span className="color__70 c-txt__xs">減価償却費へ</span>
      ),
  },
  {
    header: '領収書',
    cell: (expense) => <Receipts expense={expense} />,
  },
  {
    header: '備考',
    cell: (expense) =>
      expense.note ? <p className="c-txt__xs">{expense.note}</p> : <span className="color__70">—</span>,
  },
];

export function ExpenseDetailTable({ rows }: { rows: Expense[] }) {
  return (
    <DataTable
      columns={detailColumns}
      rows={rows}
      getKey={(expense) => expense.id}
      emptyMessage="対象年の経費が登録されていません。"
      scrollable
    />
  );
}

/* ------------------------------------------------------------------ *
 * 減価償却の対象（決算書3ページ目で計算する資産）
 * ------------------------------------------------------------------ */

const assetColumns: Column<AssetGroup>[] = [
  {
    header: '経費区分',
    cell: (row) => (
      <>
        <strong className="c-heading--sm">{row.assetType}</strong>
        {ASSET_TYPE_GUIDE[row.assetType] && (
          <p className="c-txt__min">{ASSET_TYPE_GUIDE[row.assetType].form}</p>
        )}
      </>
    ),
  },
  {
    header: '件数',
    align: 'right',
    cell: (row) => <>{row.count.toLocaleString('ja-JP')}</>,
  },
  {
    header: '取得価額の合計（円）',
    align: 'right',
    cell: (row) => <strong>{formatAmount(row.businessAmount)}</strong>,
  },
  {
    header: '当年に算入できる額',
    cell: (row) => {
      const guide = ASSET_TYPE_GUIDE[row.assetType];
      if (!guide) return <span className="color__70">—</span>;
      return guide.carryFullAmount ? (
        <Badge tone="done">全額</Badge>
      ) : (
        <Badge tone="note">要償却計算</Badge>
      );
    },
  },
  {
    header: '取り扱い',
    cell: (row) => {
      const guide = ASSET_TYPE_GUIDE[row.assetType];
      return guide ? (
        <p className="c-txt__xs">{guide.note}</p>
      ) : (
        <span className="color__70">—</span>
      );
    },
  },
];

export function AssetGroupTable({ rows }: { rows: AssetGroup[] }) {
  return (
    <DataTable
      columns={assetColumns}
      rows={rows}
      getKey={(row) => row.assetType}
      emptyMessage="減価償却の対象になる資産はありません。"
    />
  );
}

/** 資産の明細。決算書3ページ目「減価償却費の計算」に1行ずつ書く元になる */
const assetDetailColumns: Column<Expense>[] = [
  {
    header: '取得日',
    cell: (expense) =>
      formatDate(expense.date) ? (
        <time className="c-txt__sm">{formatDate(expense.date)}</time>
      ) : (
        <span className="color__70 c-txt__sm">{EMPTY_LABEL}</span>
      ),
  },
  {
    header: '資産の名称（支払先）',
    cell: (expense) => (
      <>
        <strong className="c-heading--sm">{expense.payee ?? EMPTY_LABEL}</strong>
        {expense.note && <p className="c-txt__min">{expense.note}</p>}
      </>
    ),
  },
  {
    header: '経費区分',
    cell: (expense) => <Badge tone="note">{assetTypeOf(expense)}</Badge>,
  },
  {
    header: '取得価額（円）',
    align: 'right',
    cell: (expense) => <>{formatAmount(expense.amount)}</>,
  },
  {
    header: '事業割合',
    align: 'right',
    cell: (expense) => {
      const ratio = businessRatioOf(expense);
      return (
        <>
          <span className={ratio < 100 ? undefined : 'color__70'}>{formatRatio(ratio)}</span>
          {expense.ratio_basis && <p className="c-txt__min">{expense.ratio_basis}</p>}
        </>
      );
    },
  },
  {
    header: '事業分の取得価額（円）',
    align: 'right',
    cell: (expense) => <strong>{formatAmount(businessAmountOf(expense))}</strong>,
  },
  {
    header: '領収書',
    cell: (expense) => <Receipts expense={expense} />,
  },
];

export function AssetDetailTable({ rows }: { rows: Expense[] }) {
  return (
    <DataTable
      columns={assetDetailColumns}
      rows={rows}
      getKey={(expense) => expense.id}
      emptyMessage="減価償却の対象になる資産はありません。"
    />
  );
}
