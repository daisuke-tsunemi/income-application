import { getContent, getContentIds } from '@/libs/microcms';
import Header from '@/components/Header';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EMPTY_LABEL, formatDateTime, formatSelect } from '@/libs/format';
import type { Activity } from '@/libs/types';
import styles from '@/app/detail.module.scss';

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getContent<Activity>('activities', id);
  if (!activity) notFound();

  const activatedAt = formatDateTime(activity.activatedAt);
  const dealStatus = formatSelect(activity.deals?.status);

  return (
    <>
      <Header title="活動履歴詳細" />
      <div className={styles.wrapper}>
        <aside>
          <Link href="/activities" className="c-btn__line sm u-mb16">
            一覧へ戻る
          </Link>
          <dl>
            <dt className="u-mb4 c-heading--sm color__70">案件名</dt>
            <dd className="u-mb16">
              {activity.deals ? (
                <Link href={`/deals/${activity.deals.id}`} className='c-btn--white sm'>
                  <strong>{activity.deals.title}</strong>
                </Link>
              ) : (
                <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>
              )}
            </dd>

            <dt className="u-mb4 c-heading--sm color__70">案件ステータス</dt>
            <dd className="u-mb16">
              {dealStatus ? <strong>{dealStatus}</strong> : <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>}
            </dd>
          </dl>
        </aside>

        <div className="u-align vertical start u-gap24">
          <div>{activatedAt ?? EMPTY_LABEL}
            <h2 className={styles.title}>{activity['activity-title']}</h2>
          </div>

          <section className={styles.content}>
            <h3 className="u-mb16">活動内容</h3>
            {/* textarea 項目のため改行をそのまま表示する */}
            <p style={{ whiteSpace: 'pre-wrap' }}>{activity['activity-content'] ?? EMPTY_LABEL}</p>
          </section>

          <section className={styles.content}>
            <h3 className="u-mb16">次回の活動予定</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{activity['activity-next'] ?? EMPTY_LABEL}</p>
          </section>
        </div>
      </div>
    </>
  );
}

export async function generateStaticParams() {
  const contentIds = await getContentIds('activities');

  return contentIds.map((contentId) => ({ id: contentId }));
}
