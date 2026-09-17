'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LIMIT } from '@/constants';
import styles from './pagination.module.scss';

type Props = {
  /** 絞り込み後の総件数 */
  totalCount: number;
  currentPage: number;
};

// 現在ページの前後に出すページ番号の数
const SIBLING_COUNT = 2;

/** 1 … 4 5 [6] 7 8 … 42 のように、現在ページ周辺と両端だけを並べる */
const buildPages = (currentPage: number, totalPages: number): (number | 'gap')[] => {
  const pages = new Set<number>([1, totalPages]);
  for (let page = currentPage - SIBLING_COUNT; page <= currentPage + SIBLING_COUNT; page += 1) {
    if (page >= 1 && page <= totalPages) pages.add(page);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  return sorted.flatMap((page, index) => {
    const previous = sorted[index - 1];
    if (previous === undefined || page - previous === 1) return [page];
    // 隠れるのが1ページだけなら「…」より番号をそのまま出す
    if (page - previous === 2) return [previous + 1, page];
    return ['gap' as const, page];
  });
};

export default function Pagination({ totalCount, currentPage }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(totalCount / LIMIT));
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <nav className={styles.pagination} aria-label="ページ送り">
      <ul className={styles.pagination__list}>
        <li>
          {currentPage > 1 && (
            <button onClick={() => handlePageChange(currentPage - 1)} className={styles.pagination__listBtn}>
              前へ
            </button>
          )}
        </li>
        {buildPages(currentPage, totalPages).map((page, index) =>
          page === 'gap' ? (
            <li key={`gap-${index}`}>
              <span>…</span>
            </li>
          ) : (
            <li key={page}>
              {page === currentPage ? (
                <span className={styles.pagination__listCurrent} aria-current="page">
                  {page}
                </span>
              ) : (
                <button onClick={() => handlePageChange(page)} className={styles.pagination__listBtn}>
                  {page}
                </button>
              )}
            </li>
          ),
        )}
        <li>
          {currentPage < totalPages && (
            <button onClick={() => handlePageChange(currentPage + 1)} className={styles.pagination__listBtn}>
              次へ
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
}
