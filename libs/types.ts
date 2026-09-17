export type MicroCMSImage = {
  url: string;
  height?: number;
  width?: number;
};

// microCMS が全コンテンツに付与するシステムフィールド
export type MicroCMSBase = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  revisedAt?: string;
};

export type MicroCMSListResponse<T> = {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
};

/** employees: 自社担当者 */
export type Employee = MicroCMSBase & {
  name: string;
  thumbnail?: MicroCMSImage;
  profile?: string;
};

/** customers: 顧客 */
export type Customer = MicroCMSBase & {
  name: string;
  person?: string;
  // セレクトフィールドは配列で返る
  priority?: string[];
  address?: string;
  tel?: string;
  mail?: string;
  // API 実データに存在するリッチエディタ項目
  note?: string;
};

/** services: 商材・サービス（フィールド ID がケバブケースのため文字列キーで定義） */
export type Service = MicroCMSBase & {
  'service-name': string;
  // API 実データは文字列で返るが、数値フィールドに変更された場合にも耐えるようにしている
  'service-price'?: string | number;
  'service-thumbnail'?: MicroCMSImage;
};

/** deals: 商談・案件 */
export type Deal = MicroCMSBase & {
  title: string;
  eyecatch?: MicroCMSImage;
  content?: string;
  // 単一コンテンツ参照はオブジェクト、複数コンテンツ参照は配列で返る
  customer?: Customer;
  service?: Service;
  employee?: Employee[];
  status?: string[];
  estimated?: number;
  sales?: number;
};

/** activities: 活動履歴 */
export type Activity = MicroCMSBase & {
  deals?: Deal;
  activatedAt?: string;
  'activity-title'?: string;
  'activity-content'?: string;
  'activity-next'?: string;
};
