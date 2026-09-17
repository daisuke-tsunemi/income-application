// app/services/page.tsx
import { getContents } from '@/libs/microcms';
import ServicesList from '@/components/ServicesList';
import Header from '@/components/Header';
import ListToolbar from '@/components/List/ListToolbar';
import Pagination from '@/components/List/Pagination';
import { buildListQueries, parsePage, type ListSearchParams } from '@/libs/listParams';
import type { Service } from '@/libs/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Services({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  const { page, q } = await searchParams;
  const currentPage = parsePage(page);

  const { contents: services, totalCount } = await getContents<Service>(
    'services',
    buildListQueries({
      page: currentPage,
      q,
      fields: 'id,service-name,service-price,service-thumbnail',
    }),
  );

  return (
    <>
      <Header title="商材・サービス一覧" />
      <section>
        <ListToolbar totalCount={totalCount} placeholder="サービス名で検索" />
        <ServicesList services={services} />
        <Pagination totalCount={totalCount} currentPage={currentPage} />
      </section>
    </>
  );
}
