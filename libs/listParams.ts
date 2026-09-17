import type { MicroCMSQueries } from 'microcms-js-sdk';
import { LIMIT } from '@/constants';

/** 一覧ページが受け取る URL クエリ */
export type ListSearchParams = {
  page?: string;
  q?: string;
  employee?: string;
};

/** ページ番号は1以上に丸める */
export const parsePage = (page?: string): number => Math.max(1, Number(page) || 1);

type BuildOptions = {
  page: number;
  /** microCMS の全文検索キーワード（参照先フィールドは検索対象外） */
  q?: string;
  fields?: string;
  filters?: string;
  orders?: string;
};

/** 一覧取得用の microCMS クエリを組み立てる */
export const buildListQueries = ({
  page,
  q,
  fields,
  filters,
  orders,
}: BuildOptions): MicroCMSQueries => ({
  limit: LIMIT,
  offset: (page - 1) * LIMIT,
  ...(fields ? { fields } : {}),
  ...(filters ? { filters } : {}),
  ...(orders ? { orders } : {}),
  ...(q ? { q } : {}),
});
