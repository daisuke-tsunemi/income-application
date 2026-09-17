import type { CategoryExpense, MonthlyPoint } from '@/libs/analytics';

const num = (value: number) => value.toLocaleString('ja-JP');

export function MonthlyTrendTable({ data }: { data: MonthlyPoint[] }) {
  return (
    <table>
      <caption>月別の売上・必要経費・源泉徴収税額</caption>
      <thead>
        <tr>
          <th scope="col">月</th>
          <th scope="col" className="num">売上（円）</th>
          <th scope="col" className="num">必要経費（円）</th>
          <th scope="col" className="num">源泉徴収税額（円）</th>
        </tr>
      </thead>
      <tbody>
        {data.map((point) => (
          <tr key={point.month}>
            <th scope="row">{point.label}</th>
            <td className="num">{num(point.income)}</td>
            <td className="num">{num(point.expense)}</td>
            <td className="num">{num(point.withheld)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ExpenseBreakdownTable({ data }: { data: CategoryExpense[] }) {
  return (
    <table>
      <caption>科目別の支払総額と必要経費算入額</caption>
      <thead>
        <tr>
          <th scope="col">勘定科目</th>
          <th scope="col" className="num">支払総額（円）</th>
          <th scope="col" className="num">必要経費算入額（円）</th>
          <th scope="col" className="num">件数（件）</th>
        </tr>
      </thead>
      <tbody>
        {data.map((point) => (
          <tr key={point.categoryId}>
            <th scope="row">{point.name}</th>
            <td className="num">{num(point.amount)}</td>
            <td className="num">{num(point.businessAmount)}</td>
            <td className="num">{num(point.count)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
