import Link from 'next/link';
import DataTable, { type Column } from '@/components/List/DataTable';
import Thumbnail from '@/components/List/Thumbnail';
import { EMPTY_LABEL, formatPrice } from '@/libs/format';
import type { Service } from '@/libs/types';

type Props = {
  services: Service[];
};

// first view に入る先頭2件だけ eager 読み込みにして LCP を改善する
const ABOVE_THE_FOLD_COUNT = 2;

const columns: Column<Service>[] = [
  {
    header: 'サービス名',
    cell: (service, index) => (
      <Link href={`/services/${service.id}`} className="u-align u-gap8">
        <Thumbnail
          image={service['service-thumbnail']}
          priority={index < ABOVE_THE_FOLD_COUNT}
        />
        <span className="c-heading--md">{service['service-name']}</span>
      </Link>
    ),
  },
  {
    header: '価格',
    align: 'right',
    cell: (service) => {
      const price = formatPrice(service['service-price']);
      return price ? <><strong className='c-heading--lg'>{price}</strong><small> 円</small></> : <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>;
    },
  },
];

export default function ServicesList({ services }: Props) {
  return (
    <DataTable
      columns={columns}
      rows={services}
      getKey={(service) => service.id}
      emptyMessage="該当する商材・サービスがありません。"
    />
  );
}
