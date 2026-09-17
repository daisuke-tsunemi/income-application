// 1ページの表示件数
export const LIMIT = 20;
export const TagLIMIT = 10;
export const HomeLIMIT = 4;

// 担当者フィルタの選択肢の取得件数（microCMS の limit 上限は 100）
export const EMPLOYEE_OPTIONS_LIMIT = 100;

// 商談・案件テーブルの表示に必要な項目（参照先は id と表示名のみ取得する）
export const DEALS_LIST_FIELDS =
  'id,title,publishedAt,eyecatch,status,estimated,sales,customer.id,customer.name,employee.id,employee.name';

// ダッシュボード集計に必要な項目
export const DEALS_ANALYTICS_FIELDS = 'id,publishedAt,status,estimated,sales,employee.id,employee.name';

/**
 * 商談ステータスのパイプライン順（手前 → 成約）。
 * microCMS の select 選択肢と一致させること。ここに無い値は「パイプライン外」として
 * 中立色で末尾に並ぶ。
 */
export const DEAL_STATUS_ORDER = ['検討中', '提案', '受注'] as const;

/** 受注率の分子に数えるステータス */
export const DEAL_WON_STATUS = '受注';

/** 売上推移グラフの表示月数 */
export const DASHBOARD_MONTHS = 12;

/** 担当者別グラフに個別表示する人数（超過分は「その他」にまとめる） */
export const DASHBOARD_EMPLOYEE_LIMIT = 10;
