import { createClient, type MicroCMSQueries } from 'microcms-js-sdk';

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
  /** 絞り込み後の総件数。ページャの総ページ数算出に使う */
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
 * 一覧表示には使わないこと（ページングは getContents 側で行う）。
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

/** generateStaticParams 用の ID 一覧（取得失敗時は空配列） */
export async function getContentIds(endpoint: string): Promise<string[]> {
  return client.getAllContentIds({ endpoint }).catch(() => []);
}
