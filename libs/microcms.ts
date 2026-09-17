import { createClient, type MicroCMSQueries } from 'microcms-js-sdk';
import type { Category, Client, Deduction, Expense, Income } from './types';
import {
  DEDUCTION_FIELDS,
  ENDPOINT,
  EXPENSE_FIELDS,
  INCOME_FIELDS,
} from '@/constants';

// 環境変数にMICROCMS_SERVICE_DOMAINが設定されていない場合はエラーを投げる
if (!process.env.MICROCMS_SERVICE_DOMAIN) {
  throw new Error('MICROCMS_SERVICE_DOMAIN is required');
}
// 環境変数にMICROCMS_API_KEYが設定されていない場合はエラーを投げる
if (!process.env.MICROCMS_API_KEY) {
  throw new Error('MICROCMS_API_KEY is required');
}
// Client SDKの初期化を行う
export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

export type ListResult<T> = {
  contents: T[];
  /** 絞り込み後の総件数 */
  totalCount: number;
};

/** リスト形式 API から1ページ分を取得する（取得失敗時は空リスト） */
export async function getContents<T>(
  endpoint: string,
  queries?: MicroCMSQueries,
): Promise<ListResult<T>> {
  const data = await client.get({ endpoint, queries }).catch(() => null);
  return {
    contents: (data?.contents ?? []) as T[],
    totalCount: (data?.totalCount ?? 0) as number,
  };
}

// microCMS の limit 上限
const MAX_PER_REQUEST = 100;

export type AllContentsResult<T> = ListResult<T> & {
  /** maxRequests に達して全件取れなかった場合 true */
  truncated: boolean;
};

/**
 * 集計用に全件取得する。100件ずつ辿るため、暴走しないよう取得回数に上限を設ける。
 */
export async function getAllContents<T>(
  endpoint: string,
  queries: MicroCMSQueries = {},
  maxRequests = 20,
): Promise<AllContentsResult<T>> {
  const contents: T[] = [];
  let totalCount = 0;

  for (let request = 0; request < maxRequests; request += 1) {
    const data = await client
      .get({
        endpoint,
        queries: { ...queries, limit: MAX_PER_REQUEST, offset: request * MAX_PER_REQUEST },
      })
      .catch(() => null);
    if (!data) break;

    totalCount = (data.totalCount ?? 0) as number;
    const page = (data.contents ?? []) as T[];
    contents.push(...page);

    if (page.length === 0 || contents.length >= totalCount) break;
  }

  return { contents, totalCount, truncated: contents.length < totalCount };
}

/** リスト形式 API から1件取得する（存在しない場合は null） */
export async function getContent<T>(
  endpoint: string,
  contentId: string,
  queries?: MicroCMSQueries,
): Promise<T | null> {
  const data = await client.get({ endpoint, contentId, queries }).catch(() => null);
  return (data ?? null) as T | null;
}

/* ------------------------------------------------------------------ *
 * 確定申告ダッシュボード用の取得関数
 * すべて集計が目的なので getAllContents（1リクエスト100件）で全件辿る。
 * filters には buildPeriod().filters（対象年の date 範囲）を渡す想定。
 * ------------------------------------------------------------------ */

/** 売上・源泉徴収を日付の古い順に取得する */
export const getIncomes = (filters?: string) =>
  getAllContents<Income>(ENDPOINT.income, {
    fields: INCOME_FIELDS,
    orders: 'date',
    ...(filters ? { filters } : {}),
  });

/** 経費を日付の古い順に取得する */
export const getExpenses = (filters?: string) =>
  getAllContents<Expense>(ENDPOINT.expenses, {
    fields: EXPENSE_FIELDS,
    orders: 'date',
    ...(filters ? { filters } : {}),
  });

/** 所得控除を日付の古い順に取得する */
export const getDeductions = (filters?: string) =>
  getAllContents<Deduction>(ENDPOINT.deductions, {
    fields: DEDUCTION_FIELDS,
    orders: 'date',
    ...(filters ? { filters } : {}),
  });

/** 取引先マスタ */
export const getClients = () =>
  getAllContents<Client>(ENDPOINT.clients, { orders: 'name' });

/** 経費科目マスタ */
export const getCategories = () =>
  getAllContents<Category>(ENDPOINT.categories, { orders: 'name' });
