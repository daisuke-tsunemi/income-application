import { getContent, getContents } from '@/libs/microcms';
import Header from '@/components/Header';
import DealsList from '@/components/DealsList';
import RelatedSection from '@/components/List/RelatedSection';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildListQueries, parsePage, type ListSearchParams } from '@/libs/listParams';
import type { Deal, Employee } from '@/libs/types';
import { DEALS_LIST_FIELDS } from '@/constants';
import styles from '@/app/detail.module.scss';

// 関連リストをページングするため searchParams を読む
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ListSearchParams>;
}) {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = parsePage(page);

  const employee = await getContent<Employee>('employees', id);
  if (!employee) notFound();

  // この担当者が付いている商談・案件（deals.employee が複数コンテンツ参照のため contains で絞る）
  const { contents: deals, totalCount: dealsCount } = await getContents<Deal>(
    'deals',
    buildListQueries({
      page: currentPage,
      filters: `employee[contains]${id}`,
      fields: DEALS_LIST_FIELDS,
    }),
  );

  return (
    <>
      <Header title="自社担当者詳細" />
      <div className={styles.wrapper}>
        <aside>
          <Link href="/employees" className="c-btn__line sm u-mb16">
            一覧へ戻る
          </Link>
          <Image
            src={employee.thumbnail?.url ?? '/img/common/no-image.webp'}
            width={employee.thumbnail?.width ?? 320}
            height={employee.thumbnail?.height ?? 240}
            sizes="(min-width: 1024px) 20rem, 100vw"
            alt="サムネイル"
            priority
            unoptimized // 一時的に追加
            className={styles.thumbnail}
          />
          <h2 className={styles.title}>{employee.name}</h2>

          {employee.profile && (
            <div dangerouslySetInnerHTML={{ __html: employee.profile }} />
          )}
        </aside>

        <div className="u-align vertical start u-gap24">

          <RelatedSection
            title="担当している商談・案件"
            totalCount={dealsCount}
            currentPage={currentPage}
          >
            <DealsList deals={deals} />
          </RelatedSection>
        </div>
      </div>
    </>
  );
}
