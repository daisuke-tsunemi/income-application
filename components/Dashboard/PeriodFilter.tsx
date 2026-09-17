'use client';
import Image from 'next/image';
import { useId } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from './dashboard.module.scss';

type Props = {
  /** 現在の起点月（YYYY-MM） */
  startValue: string;
  /** 「2025.10 〜 2026.09」形式の対象期間 */
  label: string;
  /** 既定の起点月。これと同じ値に戻したときはクエリを外す */
  defaultValue: string;
};

export default function PeriodFilter({ startValue, label, defaultValue }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputId = useId();

  const handleChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    // 空欄クリアや既定値は URL をきれいに保つため from を落とす
    if (next && next !== defaultValue) params.set('from', next);
    else params.delete('from');

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className={styles.filter}>
      <label className={styles.filter__label} htmlFor={inputId}>
        集計の起点
      </label>
      <input
        id={inputId}
        type="month"
        name="from"
        className={styles.filter__input}
        value={startValue}
        // input[type=month] 非対応ブラウザ（Firefox）ではテキスト入力になるための保険
        pattern="\d{4}-\d{2}"
        placeholder="YYYY-MM"
        onChange={(e) => handleChange(e.target.value)}
      />
      <p className={styles.filter__range}>
        対象期間 <strong>{label}</strong>
      </p>
      {startValue !== defaultValue && (
        <button type="button" className={styles.filter__reset} onClick={() => handleChange('')}>
          直近12ヶ月に戻す
        </button>
      )}
      <Image
        className={styles.robot}
        loading='lazy'
        src="/img/common/robot_1.webp"
        width={200}
        height={201}
        alt="robot"
      />
    </div>
  );
}
