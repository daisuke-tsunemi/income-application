import { getContent, getContents } from '@/libs/microcms';
import Header from '@/components/Header';
import DealsList from '@/components/DealsList';
import RelatedSection from '@/components/List/RelatedSection';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EMPTY_LABEL, formatPrice } from '@/libs/format';
import { buildListQueries, parsePage, type ListSearchParams } from '@/libs/listParams';
import type { Deal, Service } from '@/libs/types';
import { DEALS_LIST_FIELDS } from '@/constants';
import styles from '@/app/detail.module.scss';

// 関連リストをページングするため searchParams を読む
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<ListSearchParams>;
}) {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = parsePage(page);

  const service = await getContent<Service>('services', id);
  if (!service) notFound();

  // このサービスに紐づく商談・案件（deals.service が単一コンテンツ参照）
  const { contents: deals, totalCount: dealsCount } = await getContents<Deal>(
    'deals',
    buildListQueries({
      page: currentPage,
      filters: `service[equals]${id}`,
      fields: DEALS_LIST_FIELDS,
    }),
  );

  const thumbnail = service['service-thumbnail'];
  const price = formatPrice(service['service-price']);

  return (
    <>
      <Header title="商材・サービス詳細" />
      <div className={styles.wrapper}>
        <aside>
          <Link href="/services" className="c-btn__line sm u-mb16">
            一覧へ戻る
          </Link>
          <h2 className={styles.title}>{service['service-name']}</h2>
          <Image
            src={thumbnail?.url ?? '/img/common/no-image.webp'}
            width={thumbnail?.width ?? 320}
            height={thumbnail?.height ?? 240}
            sizes="(min-width: 1024px) 20rem, 100vw"
            alt='サムネイル'
            priority
            unoptimized // 一時的に追加
            className={styles.thumbnail}
          />
          <div className={`${styles.content} u-align u-gap16`}>
            <dt >価格</dt>
            <dd className="u-mlAuto">{price ? <strong className='c-heading--lg'>{price}</strong> : <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>} <small> 円</small></dd>
          </div>
        </aside>

        <div className="u-align vertical start u-gap24">

          <RelatedSection
            title="このサービスの商談・案件"
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
