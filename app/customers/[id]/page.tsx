import { getContent, getContents } from '@/libs/microcms';
import Header from '@/components/Header';
import DealsList from '@/components/DealsList';
import RelatedSection from '@/components/List/RelatedSection';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EMPTY_LABEL, formatSelect } from '@/libs/format';
import { buildListQueries, parsePage, type ListSearchParams } from '@/libs/listParams';
import type { Customer, Deal } from '@/libs/types';
import { DEALS_LIST_FIELDS } from '@/constants';
import styles from '@/app/detail.module.scss';

// 関連リストをページングするため searchParams を読む
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ListSearchParams>;
}) {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = parsePage(page);

  const customer = await getContent<Customer>('customers', id);
  if (!customer) notFound();

  // この顧客に紐づく商談・案件（deals.customer が単一コンテンツ参照）
  const { contents: deals, totalCount: dealsCount } = await getContents<Deal>(
    'deals',
    buildListQueries({
      page: currentPage,
      filters: `customer[equals]${id}`,
      fields: DEALS_LIST_FIELDS,
    }),
  );

  const priority = formatSelect(customer.priority);

  return (
    <>
      <Header title="顧客詳細" />
      <div className={styles.wrapper}>
        <aside>
          <Link href="/customers" className="c-btn__line sm u-mb16">
            一覧へ戻る
          </Link>
          <dl>
            <dt className="u-mb4 c-heading--sm color__70">担当者名</dt>
            <dd className="u-mb16">
              {customer.person ? <strong>{customer.person}</strong> : <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>}
            </dd>

            <dt className="u-mb4 c-heading--sm color__70">優先度</dt>
            <dd className="u-mb16">
              {priority ? <span className={styles.tag}>{priority}</span> : <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>}
            </dd>

            <dt className="u-mb4 c-heading--sm color__70">住所</dt>
            <dd className="u-mb16">{customer.address ?? <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>}</dd>

            <dt className="u-mb4 c-heading--sm color__70">電話番号</dt>
            <dd className="u-mb16">
              {customer.tel ? <span>{customer.tel}</span> : <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>}
            </dd>

            <dt className="u-mb4 c-heading--sm color__70">メールアドレス</dt>
            <dd className="u-mb16">
              {customer.mail ? (
                <span>{customer.mail}</span>
              ) : (
                <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>
              )}
            </dd>
          </dl>
        </aside>

        <div className="u-align vertical start u-gap24">
          <h2 className={styles.title}>{customer.name}</h2>

          {customer.note && (
            <div className={styles.content}>
              <h3 className="u-mb16">メモ</h3>
              <div dangerouslySetInnerHTML={{ __html: customer.note }} />
            </div>
          )}

          <RelatedSection
            title="この顧客の商談・案件"
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
