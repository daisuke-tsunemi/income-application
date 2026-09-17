'use client';

import Image from 'next/image';
import { useId } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from './dashboard.module.scss';

type Props = {
  /** 現在の対象年 */
  year: number;
  /** プルダウンに並べる年（新しい順） */
  options: number[];
  /** 既定の対象年。これと同じ値に戻したときはクエリを外す */
  defaultYear: number;
  /** 期間の右に出す補足（集計対象の件数など） */
  note?: string;
};

export default function YearFilter({ year, options, defaultYear, note }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectId = useId();

  const handleChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    // 既定年は URL をきれいに保つため year を落とす
    if (next && Number(next) !== defaultYear) params.set('year', next);
    else params.delete('year');

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className={`${styles.filter} u-align wrap u-mb24`}>
      <label className='c-txt__sm' htmlFor={selectId}>
        対象年
      </label>
      <select
        id={selectId}
        name="year"
        value={year}
        onChange={(e) => handleChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}年分
          </option>
        ))}
      </select>
      <p className={styles.filter__range}>
        集計期間 <strong>{year}.01.01 〜 {year}.12.31</strong>
        {note && <span className={styles.filter__note}>{note}</span>}
      </p>
      {year !== defaultYear && (
        <button type="button" className={styles.filter__reset} onClick={() => handleChange('')}>
          {defaultYear}年分に戻す
        </button>
      )}
      <Image
        className={styles.robot}
        loading="eager"
        src="/img/common/robot_1.webp"
        width={200}
        height={201}
        alt="robot"
      />
    </div>
  );
}
