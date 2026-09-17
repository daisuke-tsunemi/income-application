import { getContent, getContents } from '@/libs/microcms';
import Header from '@/components/Header';
import RelatedSection from '@/components/List/RelatedSection';
import Empty from '@/components/List/Empty';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { EMPTY_LABEL, formatDate, formatDateTime, formatPrice, formatSelect } from '@/libs/format';
import { buildListQueries, parsePage, type ListSearchParams } from '@/libs/listParams';
import type { Activity, Deal } from '@/libs/types';
import styles from '@/app/detail.module.scss';

// 関連リストをページングするため searchParams を読む
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DealDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ListSearchParams>;
}) {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = parsePage(page);

  const deal = await getContent<Deal>('deals', id);
  if (!deal) notFound();

  // この案件に紐づく活動履歴（activities.deals が単一コンテンツ参照）
  const { contents: activities, totalCount: activitiesCount } = await getContents<Activity>(
    'activities',
    buildListQueries({
      page: currentPage,
      filters: `deals[equals]${id}`,
      orders: '-activatedAt',
      fields: 'id,activatedAt,activity-title,activity-content,activity-next',
    }),
  );

  const publishedAt = formatDate(deal.publishedAt);
  const status = formatSelect(deal.status);
  const estimated = formatPrice(deal.estimated);
  const sales = formatPrice(deal.sales);
  const servicePrice = formatPrice(deal.service?.['service-price']);

  return (
    <>
      <Header title="商談・案件詳細" />
      <div className={styles.wrapper}>
        <aside>
          <Link href="/deals" className="c-btn__line sm u-mb16">
            一覧へ戻る
          </Link>
          <Image
            src={deal.eyecatch?.url ?? '/img/common/no-image.webp'}
            width={deal.eyecatch?.width ?? 320}
            height={deal.eyecatch?.height ?? 240}
            sizes="(min-width: 1024px) 20rem, 100vw"
            alt=""
            priority
            unoptimized // 一時的に追加
            className={styles.thumbnail}
          />
          <dl>
            <dt className="u-mb4 c-heading--sm color__70">ステータス</dt>
            <dd className="u-mb16">{status ? <strong>{status}</strong> : <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>}</dd>

            <dt className="u-mb4 c-heading--sm color__70">顧客名</dt>
            <dd className="u-mb16">
              {deal.customer ? (
                <Link href={`/customers/${deal.customer.id}`} className='c-btn--white sm'>
                  <strong>{deal.customer.name}</strong>
                </Link>
              ) : (
                <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>
              )}
            </dd>

            <dt className="u-mb4 c-heading--sm color__70">商材・サービス</dt>
            <dd className="u-mb16">
              {deal.service ? (
                <Link href={`/services/${deal.service.id}`} className='c-btn--white sm'>
                  <strong>{deal.service['service-name']}</strong>
                  {servicePrice && <span>（{servicePrice} 円）</span>}
                </Link>
              ) : (
                <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>
              )}
            </dd>

            <dt className="u-mb4 c-heading--sm color__70">見込み金額</dt>
            <dd className="u-mb16">{estimated ? <><strong className='c-heading--xl'>{estimated}</strong><small> 円</small></> : <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>}</dd>

            <dt className="u-mb4 c-heading--sm color__70">売上金額</dt>
            <dd className="u-mb16">{sales ? <><strong className='c-heading--xl'>{sales}</strong><small> 円</small></> : <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>}</dd>

            <dt className="u-mb4 c-heading--sm color__70">自社担当者</dt>
            <dd className="u-mb16">
              {deal.employee && deal.employee.length > 0 ? (
                <div className="u-align wrap u-gap4">
                  {deal.employee.map((employee) => (
                    <Link
                      key={employee.id}
                      href={`/employees/${employee.id}`}
                      className={`${styles.tag} c-heading--sm`}
                    >
                      {employee.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>
              )}
            </dd>
          </dl>
        </aside>

        <div className="u-align vertical start u-gap24">
          <div>
            <h2 className={styles.title}>{deal.title}</h2>
            {publishedAt && <time className="c-txt__sm">{publishedAt}</time>}
          </div>

          {deal.content && (
            <div className={styles.content}>
              <div dangerouslySetInnerHTML={{ __html: deal.content }} />
            </div>
          )}

          <RelatedSection title="活動履歴" totalCount={activitiesCount} currentPage={currentPage}>
            {activities.length === 0 ? (
              <Empty message="この案件に紐づく活動履歴はまだありません。" />
            ) : (
              <dl>
                {activities.map((activity) => (
                  <div key={activity.id} className={`${styles.list} u-mb16`}>
                    <dt className="u-mb4 c-heading--sm">
                      <Link href={`/activities/${activity.id}`}>
                        <span>{formatDateTime(activity.activatedAt) ?? EMPTY_LABEL}</span><br />
                        <strong className='c-heading--md'>{activity['activity-title'] ?? EMPTY_LABEL}</strong>
                      </Link>
                    </dt>
                    <dd>
                      <p>{activity['activity-content'] ?? EMPTY_LABEL}</p>
                      {activity['activity-next'] && (
                        <p className="c-txt__sm">次回：{activity['activity-next']}</p>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </RelatedSection>
        </div>
      </div>
    </>
  );
}
