// app/activities/page.tsx
import { getContents } from '@/libs/microcms';
import ActivitiesList from '@/components/ActivitiesList';
import Header from '@/components/Header';
import ListToolbar from '@/components/List/ListToolbar';
import Pagination from '@/components/List/Pagination';
import { buildListQueries, parsePage, type ListSearchParams } from '@/libs/listParams';
import type { Activity } from '@/libs/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Activities({
  searchParams,
}: {
  searchParams: Promise<ListSearchParams>;
}) {
  const { page, q } = await searchParams;
  const currentPage = parsePage(page);

  const { contents: activities, totalCount } = await getContents<Activity>(
    'activities',
    buildListQueries({
      page: currentPage,
      q,
      fields: 'id,activatedAt,activity-title,activity-content,activity-next,deals.id,deals.title',
      orders: '-activatedAt',
    }),
  );

  return (
    <>
      <Header title="活動履歴一覧" />
      <section>
        <ListToolbar totalCount={totalCount} placeholder="活動内容・次回予定で検索" />
        <ActivitiesList activities={activities} />
        <Pagination totalCount={totalCount} currentPage={currentPage} />
      </section>
    </>
  );
}
