import Empty from './Empty';
import styles from './list.module.scss';

export type Column<T> = {
  header: string;
  cell: (item: T, index: number) => React.ReactNode;
  /** 金額など右寄せしたい列に指定する */
  align?: 'right';
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  getKey: (item: T) => string;
  emptyMessage?: string;
  /**
   * 明細のように行数が読めない表で、高さを固定してヘッダを固定表示する。
   * 集計表（数行しかない）では余白が出るだけなので既定は false。
   */
  scrollable?: boolean;
};

export default function DataTable<T>({
  columns,
  rows,
  getKey,
  emptyMessage,
  scrollable = false,
}: Props<T>) {
  if (rows.length === 0) return <Empty message={emptyMessage} />;

  return (
    <div className="t-wrapper">
      <div className="t-body">
        <div className={`t-table ${scrollable ? '' : styles.autoHeight}`}>
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.header} className={column.align === 'right' ? 'u-right' : undefined}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={getKey(row)}>
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      className={column.align === 'right' ? `u-right ${styles.num}` : undefined}
                    >
                      {column.cell(row, index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
