import type { EmployeePoint, MonthlyPoint, StatusPoint } from '@/libs/analytics';

const num = (value: number) => value.toLocaleString('ja-JP');

export function MonthlyTrendTable({ data }: { data: MonthlyPoint[] }) {
  return (
    <table>
      <caption>月別の売上金額と見込み金額</caption>
      <thead>
        <tr>
          <th scope="col">月</th>
          <th scope="col" className="num">売上金額（円）</th>
          <th scope="col" className="num">見込み金額（円）</th>
        </tr>
      </thead>
      <tbody>
        {data.map((point) => (
          <tr key={point.month}>
            <th scope="row">{point.label}</th>
            <td className="num">{num(point.sales)}</td>
            <td className="num">{num(point.estimated)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function StatusBreakdownTable({ data }: { data: StatusPoint[] }) {
  return (
    <table>
      <caption>ステータス別の商談数</caption>
      <thead>
        <tr>
          <th scope="col">ステータス</th>
          <th scope="col" className="num">商談数（件）</th>
        </tr>
      </thead>
      <tbody>
        {data.map((point) => (
          <tr key={point.status}>
            <th scope="row">{point.status}</th>
            <td className="num">{num(point.count)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function EmployeeSalesTable({ data }: { data: EmployeePoint[] }) {
  return (
    <table>
      <caption>担当者別の売上金額と担当件数</caption>
      <thead>
        <tr>
          <th scope="col">担当者</th>
          <th scope="col" className="num">売上金額（円）</th>
          <th scope="col" className="num">担当件数（件）</th>
        </tr>
      </thead>
      <tbody>
        {data.map((point) => (
          <tr key={point.name}>
            <th scope="row">{point.name}</th>
            <td className="num">{num(point.sales)}</td>
            <td className="num">{num(point.count)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
