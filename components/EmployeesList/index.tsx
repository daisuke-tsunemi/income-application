import Link from 'next/link';
import DataTable, { type Column } from '@/components/List/DataTable';
import Thumbnail from '@/components/List/Thumbnail';
import type { Employee } from '@/libs/types';

type Props = {
  employees: Employee[];
};

// first view に入る先頭2件だけ eager 読み込みにして LCP を改善する
const ABOVE_THE_FOLD_COUNT = 2;

/** リッチエディタの HTML からタグを除いた抜粋を作る */
const toExcerpt = (html?: string, length = 60) => {
  if (!html) return null;
  const text = html.replace(/<[^>]*>/g, '').trim();
  if (!text) return null;
  return text.length > length ? `${text.slice(0, length)}…` : text;
};

const columns: Column<Employee>[] = [
  {
    header: '担当者名',
    cell: (employee, index) => (
      <Link href={`/employees/${employee.id}`} className="u-align u-gap8">
        <Thumbnail image={employee.thumbnail} priority={index < ABOVE_THE_FOLD_COUNT} />
        <span className="c-heading--md">{employee.name}</span>
      </Link>
    ),
  },
  {
    header: 'プロフィール',
    cell: (employee) => <p className='c-txt__sm'>{toExcerpt(employee.profile) ?? '—'}</p>,
  },
];

export default function EmployeesList({ employees }: Props) {
  return (
    <DataTable
      columns={columns}
      rows={employees}
      getKey={(employee) => employee.id}
      emptyMessage="該当する担当者がありません。"
    />
  );
}
