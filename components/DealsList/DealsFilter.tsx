'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Employee } from '@/libs/types';
import styles from '@/components/List/search.module.scss';

type Props = {
  employees: Employee[];
};

export default function DealsFilter({ employees }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const employeeId = searchParams.get('employee') ?? '';

  const handleChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set('employee', next);
    else params.delete('employee');
    // 絞り込みが変わったら1ページ目に戻す
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <select
      className={styles.search__select}
      name="employee"
      aria-label="担当者で絞り込む"
      value={employeeId}
      onChange={(e) => handleChange(e.target.value)}
    >
      <option value="">すべての担当者</option>
      {employees.map((employee) => (
        <option key={employee.id} value={employee.id}>
          {employee.name}
        </option>
      ))}
    </select>
  );
}
