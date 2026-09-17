import Empty from './Empty';

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
};

export default function DataTable<T>({ columns, rows, getKey, emptyMessage }: Props<T>) {
  if (rows.length === 0) return <Empty message={emptyMessage} />;

  return (
    <div className="t-wrapper">
      <div className="t-body">
        <div className="t-table">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.header}>{column.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={getKey(row)}>
                  {columns.map((column) => (
                    <td key={column.header} className={column.align === 'right' ? 'u-right' : undefined}>
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
