'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from './search.module.scss';

// 1文字ごとに API を叩かないよう入力を落ち着かせる時間
const DEBOUNCE_MS = 300;

type Props = {
  placeholder?: string;
};

export default function SearchBox({ placeholder = 'キーワードで検索' }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // アンマウント時に予約済みの遷移を取り消す
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleChange = (next: string) => {
    if (timer.current) clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set('q', next);
      else params.delete('q');
      // 検索条件が変わったら1ページ目に戻す
      params.delete('page');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, DEBOUNCE_MS);
  };

  return (
    // 入力中に URL 更新で値が巻き戻らないよう非制御にしている
    <input
      type="search"
      name="q"
      className={styles.search}
      placeholder={placeholder}
      defaultValue={searchParams.get('q') ?? ''}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
