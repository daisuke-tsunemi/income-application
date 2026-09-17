import Badge from '@/components/Badge';
import DataTable, { type Column } from '@/components/List/DataTable';
import Thumbnail from '@/components/List/Thumbnail';
import { EMPTY_LABEL, formatAmount, formatDate } from '@/libs/format';
import type { DeductionGroup } from '@/libs/analytics';
import type { Deduction } from '@/libs/types';
import { DEDUCTION_GUIDE, MEDICAL_DEDUCTION_TYPE } from '@/constants';

/* ------------------------------------------------------------------ *
 * 控除種別ごとの集計（確定申告書 第一表・第二表の所得控除欄へ転記する単位）
 * ------------------------------------------------------------------ */

const groupColumns: Column<DeductionGroup>[] = [
  {
    header: '控除の種類',
    cell: (row) => (
      <>
        <strong className="c-heading--sm">{row.type}</strong>
        {DEDUCTION_GUIDE[row.type] && (
          <p className="c-txt__min">{DEDUCTION_GUIDE[row.type].form}</p>
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
    header: '支払金額の合計（円）',
    align: 'right',
    cell: (row) => <strong>{formatAmount(row.amount)}</strong>,
  },
  {
    header: '補填される金額（円）',
    align: 'right',
    cell: (row) =>
      row.compensatedAmount > 0 ? (
        <>&minus;{formatAmount(row.compensatedAmount)}</>
      ) : (
        <span className="color__70">0</span>
      ),
  },
  {
    header: '差引（円）',
    align: 'right',
    cell: (row) =>
      row.compensatedAmount > 0 ? (
        <strong>{formatAmount(row.netAmount)}</strong>
      ) : (
        <span className="color__70">{formatAmount(row.netAmount)}</span>
      ),
  },
  {
    header: '第二表の区分',
    cell: (row) => {
      if (row.breakdown.length === 0 && row.missingCategoryCount === 0) {
        return <span className="color__70">—</span>;
      }
      return (
        <>
          {row.breakdown.map((item) => (
            <p key={item.category} className="c-txt__sm">
              {item.category}　<strong>{formatAmount(item.amount)}</strong> 円
            </p>
          ))}
          {row.missingCategoryCount > 0 && (
            <Badge tone="todo">区分未設定 {row.missingCategoryCount} 件</Badge>
          )}
        </>
      );
    },
  },
  {
    // 合計をそのまま入力してよいのか、計算・区分が要るのかを一目で示す
    header: '転記',
    cell: (row) => {
      const guide = DEDUCTION_GUIDE[row.type];
      if (!guide) return <span className="color__70 c-txt__xs">—</span>;
      return guide.direct ? (
        <Badge tone="done">支払額＝控除額</Badge>
      ) : (
        <Badge tone="note">要計算・区分</Badge>
      );
    },
  },
  {
    header: '証明書の添付',
    cell: (row) => {
      const missing = row.items.filter((item) => !item.certificate_image).length;
      return missing > 0 ? (
        <Badge tone="todo">未添付 {missing} 件</Badge>
      ) : (
        <Badge tone="done">全件あり</Badge>
      );
    },
  },
];

export function DeductionByTypeTable({ rows }: { rows: DeductionGroup[] }) {
  return (
    <DataTable
      columns={groupColumns}
      rows={rows}
      getKey={(row) => row.type}
      emptyMessage="対象年の所得控除が登録されていません。"
    />
  );
}

/* ------------------------------------------------------------------ *
 * 控除明細
 * ------------------------------------------------------------------ */

function Certificate({ image }: { image: Deduction['certificate_image'] }) {
  if (!image) return <Badge tone="todo">未添付</Badge>;

  return (
    <a href={image.url} target="_blank" rel="noopener noreferrer" title="証明書を開く">
      <Thumbnail image={image} alt="控除証明書" />
    </a>
  );
}

const detailColumns: Column<Deduction>[] = [
  {
    header: '支払日',
    cell: (deduction) =>
      formatDate(deduction.date) ? (
        <time className="c-txt__sm">{formatDate(deduction.date)}</time>
      ) : (
        <span className="color__70 c-txt__sm">{EMPTY_LABEL}</span>
      ),
  },
  {
    header: '控除の種類',
    cell: (deduction) => {
      const type = deduction.deduction_type?.[0] ?? EMPTY_LABEL;
      const category = deduction.insurance_category?.[0];
      const needsCategory = type !== MEDICAL_DEDUCTION_TYPE && DEDUCTION_GUIDE[type]?.direct === false;
      return (
        <>
          <strong className="c-heading--sm">{type}</strong>
          {category ? (
            <p className="c-txt__min">{category}</p>
          ) : (
            needsCategory && (
              <p>
                <Badge tone="todo">区分未設定</Badge>
              </p>
            )
          )}
        </>
      );
    },
  },
  {
    header: '支払先',
    cell: (deduction) => deduction.payee ?? <span className="color__70">{EMPTY_LABEL}</span>,
  },
  {
    header: '支払金額（円）',
    align: 'right',
    cell: (deduction) => <strong>{formatAmount(deduction.amount)}</strong>,
  },
  {
    header: '補填される金額（円）',
    align: 'right',
    cell: (deduction) =>
      (deduction.compensated_amount ?? 0) > 0 ? (
        <>&minus;{formatAmount(deduction.compensated_amount)}</>
      ) : (
        <span className="color__70">0</span>
      ),
  },
  {
    header: '証明書',
    cell: (deduction) => <Certificate image={deduction.certificate_image} />,
  },
  {
    header: '備考',
    cell: (deduction) =>
      deduction.note ? (
        <p className="c-txt__sm">{deduction.note}</p>
      ) : (
        <span className="color__70">—</span>
      ),
  },
];

export function DeductionDetailTable({ rows }: { rows: Deduction[] }) {
  return (
    <DataTable
      columns={detailColumns}
      rows={rows}
      getKey={(deduction) => deduction.id}
      emptyMessage="対象年の所得控除が登録されていません。"
      scrollable
    />
  );
}
