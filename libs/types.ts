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

/** clients: 取引先（売上の支払者）。確定申告 第二表「所得の内訳」の支払者にあたる */
export type Client = MicroCMSBase & {
  name: string;
  address?: string;
  // セレクトフィールドは配列で返る。第二表「所得の種類」欄
  income_type?: string[];
  note?: string;
};

/** categories: 経費科目（青色申告決算書の勘定科目） */
export type Category = MicroCMSBase & {
  name: string;
  description?: string;
  /** 決算書の印字順。小さいほど上。未設定は科目名から推定する */
  sort_order?: number;
};

/** income: 売上・源泉徴収。エンドポイントは単数形の `income` */
export type Income = MicroCMSBase & {
  date?: string;
  // 単一コンテンツ参照はオブジェクトで返る
  client?: Client;
  amount?: number;
  /** 源泉徴収税額。源泉なしの取引先は 0 */
  tax_withheld?: number;
  // セレクトフィールドは配列で返る（'10%' | '8%'）。課税事業者になった場合の消費税額試算用。
  // 未設定は「対象外」ではなく「まだ入力していない」の可能性もあるため区別できない
  tax_rate?: string[];
  /** 支払調書と突き合わせ済みか */
  is_verified?: boolean;
  /** 第二表「所得の内訳」の種目（原稿料・デザイン料など） */
  income_category?: string;
  /** 入金日。計上は date（発生日）で行うので集計には使わない */
  paid_date?: string;
  memo?: string;
};

/** expenses: 経費 */
export type Expense = MicroCMSBase & {
  date?: string;
  category?: Category;
  payee?: string;
  // セレクトフィールドは配列で返る
  payment_method?: string[];
  /** 経費区分。「経費（10万円未満）」以外は減価償却の対象で、経費計には入れない */
  asset_type?: string[];
  /** 支払総額（家事分を含む） */
  amount?: number;
  // セレクトフィールドは配列で返る（'10%' | '8%'）。課税事業者になった場合の仕入税額控除試算用
  tax_rate?: string[];
  /** 事業割合（%）。未設定は 100% とみなす */
  business_ratio?: number;
  /** 按分の根拠（床面積比など）。税務調査で問われる */
  ratio_basis?: string;
  /** 支払先の適格請求書発行事業者登録番号（T + 13桁）。課税事業者になった場合の参考記録用 */
  invoice_number?: string;
  receipt_images?: MicroCMSImage[];
  note?: string;
};

/** deductions: 所得控除 */
export type Deduction = MicroCMSBase & {
  date?: string;
  // セレクトフィールドは配列で返る
  deduction_type?: string[];
  /** 生命保険料・地震保険料の区分。第二表はこの単位で行を分ける */
  insurance_category?: string[];
  payee?: string;
  amount?: number;
  /** 医療費控除の「保険金などで補填される金額」 */
  compensated_amount?: number;
  certificate_image?: MicroCMSImage;
  note?: string;
};
