import Link from 'next/link';
import DataTable, { type Column } from '@/components/List/DataTable';
import { EMPTY_LABEL, formatSelect } from '@/libs/format';
import type { Customer } from '@/libs/types';
import styles from '@/components/List/list.module.scss';

type Props = {
  customers: Customer[];
};

const columns: Column<Customer>[] = [
  {
    header: '顧客名',
    cell: (customer) => (
      <Link href={`/customers/${customer.id}`} className="c-heading--md">
        {customer.name}
      </Link>
    ),
  },
  {
    header: '担当者名',
    cell: (customer) => customer.person ?? <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>,
  },
  {
    header: '優先度',
    cell: (customer) => {
      const priority = formatSelect(customer.priority);
      return priority ? <span className={styles.tag}>{priority}</span> : <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>;
    },
  },
  {
    header: '電話番号',
    cell: (customer) =>
      customer.tel ? <span>{customer.tel}</span> : <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>,
  },
  {
    header: 'メールアドレス',
    cell: (customer) =>
      customer.mail ? (
        <span>{customer.mail}</span>
      ) : (
        <span className='color__70 c-heading--sm'>{EMPTY_LABEL}</span>
      ),
  },
];

export default function CustomersList({ customers }: Props) {
  return (
    <DataTable
      columns={columns}
      rows={customers}
      getKey={(customer) => customer.id}
      emptyMessage="該当する顧客がありません。"
    />
  );
}
