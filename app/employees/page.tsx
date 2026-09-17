// app/employees/page.tsx
import { getContents } from '@/libs/microcms';
import EmployeesList from '@/components/EmployeesList';
import Header from '@/components/Header';
import ListToolbar from '@/components/List/ListToolbar';
import Pagination from '@/components/List/Pagination';
import { buildListQueries, parsePage, type ListSearchParams } from '@/libs/listParams';
import type { Employee } from '@/libs/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Employees({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  const { page, q } = await searchParams;
  const currentPage = parsePage(page);

  const { contents: employees, totalCount } = await getContents<Employee>(
    'employees',
    buildListQueries({
      page: currentPage,
      q,
      fields: 'id,name,thumbnail,profile',
    }),
  );

  return (
    <>
      <Header title="自社担当者一覧" />
      <section>
        <ListToolbar totalCount={totalCount} placeholder="担当者名で検索" />
        <EmployeesList employees={employees} />
        <Pagination totalCount={totalCount} currentPage={currentPage} />
      </section>
    </>
  );
}
