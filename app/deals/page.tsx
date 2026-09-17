// app/deals/page.tsx
import { getContents } from '@/libs/microcms';
import DealsList from '@/components/DealsList';
import DealsFilter from '@/components/DealsList/DealsFilter';
import Header from '@/components/Header';
import ListToolbar from '@/components/List/ListToolbar';
import Pagination from '@/components/List/Pagination';
import { buildListQueries, parsePage, type ListSearchParams } from '@/libs/listParams';
import type { Deal, Employee } from '@/libs/types';
import { DEALS_LIST_FIELDS, EMPLOYEE_OPTIONS_LIMIT } from '@/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Deals({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  const { page, q, employee } = await searchParams;
  const currentPage = parsePage(page);

  const [{ contents: deals, totalCount }, { contents: employees }] = await Promise.all([
    getContents<Deal>(
      'deals',
      buildListQueries({
        page: currentPage,
        q,
        fields: DEALS_LIST_FIELDS,
        filters: employee ? `employee[contains]${employee}` : undefined,
      }),
    ),
    // 担当者フィルタの選択肢は employees API から引く（表示中のページに依存させない）
    getContents<Employee>('employees', {
      fields: 'id,name',
      orders: 'name',
      limit: EMPLOYEE_OPTIONS_LIMIT,
    }),
  ]);

  return (
    <>
      <Header title="商談・案件一覧" />
      <section>
        <ListToolbar totalCount={totalCount} placeholder="案件名・本文で検索">
          <DealsFilter employees={employees} />
        </ListToolbar>
        <DealsList deals={deals} />
        <Pagination totalCount={totalCount} currentPage={currentPage} />
      </section>
    </>
  );
}
