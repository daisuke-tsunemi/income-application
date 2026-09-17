// app/customers/page.tsx
import { getContents } from '@/libs/microcms';
import CustomersList from '@/components/CustomersList';
import Header from '@/components/Header';
import ListToolbar from '@/components/List/ListToolbar';
import Pagination from '@/components/List/Pagination';
import { buildListQueries, parsePage, type ListSearchParams } from '@/libs/listParams';
import type { Customer } from '@/libs/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Customers({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  const { page, q } = await searchParams;
  const currentPage = parsePage(page);

  const { contents: customers, totalCount } = await getContents<Customer>(
    'customers',
    buildListQueries({
      page: currentPage,
      q,
      fields: 'id,name,person,priority,tel,mail',
    }),
  );

  return (
    <>
      <Header title="顧客一覧" />
      <section>
        <ListToolbar totalCount={totalCount} placeholder="顧客名・担当者名・メールで検索" />
        <CustomersList customers={customers} />
        <Pagination totalCount={totalCount} currentPage={currentPage} />
      </section>
    </>
  );
}
