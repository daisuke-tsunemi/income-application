/** microCMS のエンドポイント名（income だけ単数形なので定数に寄せる） */
export const ENDPOINT = {
  income: 'income',
  expenses: 'expenses',
  deductions: 'deductions',
  clients: 'clients',
  categories: 'categories',
} as const;

/** 年選択のプルダウンに並べる年数（確定申告は5年前まで遡って提出できる） */
export const YEAR_OPTIONS_COUNT = 5;

/** 集計に必要な項目だけ取得する（参照先は表示に使うフィールドのみ） */
export const INCOME_FIELDS =
  'id,date,amount,tax_rate,tax_withheld,is_verified,income_category,paid_date,memo,' +
  'client.id,client.name,client.address,client.income_type';

export const EXPENSE_FIELDS =
  'id,date,payee,payment_method,asset_type,amount,tax_rate,business_ratio,ratio_basis,invoice_number,receipt_images,note,' +
  'category.id,category.name,category.sort_order';

export const DEDUCTION_FIELDS =
  'id,date,deduction_type,insurance_category,payee,amount,compensated_amount,certificate_image,note';

/**
 * 所得控除の種別の表示順（確定申告書 第一表の並び順）。
 * ここに無い値は「その他」として末尾に回る。
 */
export const DEDUCTION_TYPE_ORDER = [
  '社会保険料（国保・年金等）',
  '小規模企業共済等掛金',
  '生命保険料',
  '地震保険料',
  '医療費',
  '寄付金（ふるさと納税）',
] as const;

/**
 * 控除ごとの転記ガイド。
 * direct: 支払額がそのまま控除額になる（表示している合計をそのまま入力してよい）
 * それ以外は計算式・足切り・区分記入が挟まるため、合計をそのまま入れると誤りになる。
 */
export type DeductionGuide = {
  /** 転記先の様式と欄名 */
  form: string;
  direct: boolean;
  /** 転記時に詰まる点 */
  caution?: string;
};

export const DEDUCTION_GUIDE: Record<string, DeductionGuide> = {
  '社会保険料（国保・年金等）': {
    form: '第一表「社会保険料控除」／第二表 同欄',
    direct: true,
    caution: '第二表には「保険料等の種類」ごとに分けて記入する。',
  },
  '小規模企業共済等掛金': {
    form: '第一表「小規模企業共済等掛金控除」／第二表 同欄',
    direct: true,
    caution: '第二表には掛金の種類（共済・iDeCo 等）ごとに分けて記入する。',
  },
  生命保険料: {
    form: '第一表「生命保険料控除」／第二表 同欄',
    direct: false,
    caution:
      '第二表は「新生命保険料／旧生命保険料／介護医療保険料／新個人年金保険料／旧個人年金保険料」の5区分に分けて記入する。控除額は区分ごとの計算式で決まり、合計で最大12万円。証明書の区分表記を確認すること。',
  },
  地震保険料: {
    form: '第一表「地震保険料控除」／第二表 同欄',
    direct: false,
    caution:
      '第二表は「地震保険料／旧長期損害保険料」の2区分に分けて記入する。控除額の上限は地震保険料5万円・旧長期損害保険料1.5万円。',
  },
  医療費: {
    form: '第一表「医療費控除」／医療費控除の明細書',
    direct: false,
    caution:
      '「保険金などで補填される金額」を差し引き、さらに10万円（総所得金額等が200万円未満ならその5%）を引いた額が控除額。本システムは補填額を保持していないため、明細書側で調整すること。',
  },
  '寄付金（ふるさと納税）': {
    form: '第一表「寄附金控除」／第二表 同欄',
    direct: false,
    caution:
      '合計から2,000円を差し引いた額が控除額。確定申告をするとワンストップ特例は無効になるため、特例を申請済みの分も含めて全額を申告すること。',
  },
};

/**
 * 青色申告決算書 損益計算書の経費科目の印字順。
 * 決算書は科目があらかじめ印字されているため、この順に並べると上から順に転記できる。
 * ここに無い科目名は決算書の空欄行に自分で記入するものとして末尾にまとめる。
 */
export const EXPENSE_CATEGORY_ORDER = [
  '租税公課',
  '荷造運賃',
  '水道光熱費',
  '旅費交通費',
  '通信費',
  '広告宣伝費',
  '接待交際費',
  '損害保険料',
  '修繕費',
  '消耗品費',
  '減価償却費',
  '福利厚生費',
  '給料賃金',
  '外注工賃',
  '利子割引料',
  '地代家賃',
  '貸倒金',
  '雑費',
] as const;

/** 本システムが集計しない欄（「画面に出ない＝0円」という誤解を防ぐために明示する） */
export const UNCOVERED_ITEMS = {
  expenses: [
    '売上原価（期首・期末棚卸高、仕入金額）',
    '減価償却費（10万円以上の資産の償却計算・3ページ目の内訳）',
    '地代家賃・利子割引料の内訳（3ページ目）',
    '給料賃金・専従者給与の内訳（2ページ目）',
    '貸倒引当金の繰入・戻入',
  ],
  income: ['家事消費・雑収入', '事業所得以外の所得（不動産・給与・雑所得など）'],
  deductions: [
    '基礎控除・配偶者控除・扶養控除などの人的控除',
    '雑損控除',
    '寡婦・ひとり親・勤労学生・障害者控除',
  ],
  overall: [
    '貸借対照表（青色申告特別控除65万円の適用に必須）',
    '青色申告特別控除額の計算',
    '消費税の申告（税率別の内訳は参考表示のみ。納税額の計算・申告書の作成は別途）',
  ],
} as const;

/**
 * これ以上の取得価額は、その年の経費に全額を算入できず減価償却の判定が要る。
 * asset_type が未設定のまま放置されていないかの検出にも使う。
 */
export const DEPRECIABLE_THRESHOLD = 100_000;

/** asset_type のうち、決算書の「経費」欄にそのまま計上してよい唯一の区分 */
export const ASSET_TYPE_EXPENSE = '経費（10万円未満）';

/** 少額減価償却資産の特例（措法28の2）の asset_type 値。年間合計300万円の上限判定に使う */
export const ASSET_TYPE_SMALL_SPECIAL = '少額減価償却資産の特例（30万円未満・青色）';

/** 少額減価償却資産の特例の年間上限額（青色申告者のみ・個人事業者） */
export const SMALL_SPECIAL_ANNUAL_LIMIT = 3_000_000;

/**
 * 経費区分ごとの取り扱い。
 * carryFullAmount: 取得価額の全額を当年に算入できるか（できない場合は償却計算が要る）
 */
export type AssetTypeGuide = {
  /** 決算書のどの欄に計上するか */
  form: string;
  carryFullAmount: boolean;
  note: string;
};

export const ASSET_TYPE_GUIDE: Record<string, AssetTypeGuide> = {
  [ASSET_TYPE_EXPENSE]: {
    form: '損益計算書の該当科目',
    carryFullAmount: true,
    note: '取得価額の全額をその年の経費にできる。',
  },
  '一括償却資産（10万円以上20万円未満・3年均等）': {
    form: '損益計算書「減価償却費」／決算書3ページ目',
    carryFullAmount: false,
    note: '取得価額を3年で均等に償却する。当年に算入できるのは原則として取得価額の3分の1で、取得年より前の資産も同額ずつ続く。',
  },
  [ASSET_TYPE_SMALL_SPECIAL]: {
    form: '損益計算書「減価償却費」／決算書3ページ目',
    carryFullAmount: true,
    note: '全額をその年の経費にできるが、計上先は科目ではなく「減価償却費」。決算書3ページ目の摘要に「措法28の2」と記載し、年間合計300万円が上限。',
  },
  '減価償却資産（30万円以上）': {
    form: '損益計算書「減価償却費」／決算書3ページ目',
    carryFullAmount: false,
    note: '耐用年数に応じて償却する。当年分の償却費は決算書3ページ目で計算すること。',
  },
};

/** 第二表で保険料控除の行を分ける区分の記入順 */
export const INSURANCE_CATEGORY_ORDER = [
  '新生命保険料',
  '旧生命保険料',
  '介護医療保険料',
  '新個人年金保険料',
  '旧個人年金保険料',
  '地震保険料',
  '旧長期損害保険料',
] as const;

/** 保険料の区分記入が要る控除（未設定なら入力を促す） */
export const INSURANCE_CATEGORY_REQUIRED = ['生命保険料', '地震保険料'] as const;

/** 医療費控除の足切り額。総所得金額等が200万円未満ならその5%が使われる */
export const MEDICAL_DEDUCTION_FLOOR = 100_000;
export const MEDICAL_DEDUCTION_FLOOR_RATE = 0.05;
export const MEDICAL_DEDUCTION_TYPE = '医療費';

/** ダッシュボードの経費内訳グラフに個別表示する科目数（超過分は「その他」にまとめる） */
export const EXPENSE_CATEGORY_LIMIT = 10;

/** 未確認売上アラートに表示する最大件数 */
export const UNVERIFIED_ALERT_LIMIT = 10;

/**
 * 消費税率（tax_rate）の税込→税抜換算に使う小数表現。
 * income・expenses 共通の select 選択肢と一致させること。
 * ここに無い値（未選択も含む）は「未設定」として扱い、換算しない。
 */
export const TAX_RATE_DECIMAL: Record<string, number> = {
  '10%': 0.1,
  '8%': 0.08,
};

/** 消費税率が未選択の明細のラベル。「対象外」なのか「未入力」なのかは区別できない */
export const TAX_RATE_UNSET_LABEL = '未設定';

/**
 * 自宅兼事務所などで家事按分が必要になりやすい勘定科目。
 * ここに該当し、かつ事業割合100%・按分根拠未記入の明細は税務調査で問われやすい典型パターンとして警告する。
 */
export const MIXED_USE_PRONE_CATEGORIES = ['地代家賃', '水道光熱費', '通信費'] as const;

/**
 * インボイス登録に伴う消費税の経過措置（2割特例→3割特例）。個人事業者限定（法人は対象外）。
 * - 2割特例: 令和5年10月1日〜令和8年9月30日を含む課税期間が対象。個人の課税期間は暦年のため
 *   2023〜2026年分が対象（2026年分が最後）。届出不要、確定申告書への付記のみで適用できる。
 * - 3割特例: 令和8年度税制改正で新設。2割特例終了後も個人事業者に限り2027・2028年分の
 *   2年間延長する経過措置。こちらも届出不要。
 * どちらも「インボイス登録が理由で免税事業者から課税事業者になった」場合などの要件があり、
 * 基準期間の課税売上高が1,000万円を超えて元々課税事業者だった場合などは対象外。
 */
export type ConsumptionTaxRelief = {
  /** 制度名 */
  label: string;
  /** 売上に係る消費税額に掛ける割合 */
  rate: number;
};

export const CONSUMPTION_TAX_RELIEF_BY_YEAR: Record<number, ConsumptionTaxRelief> = {
  2023: { label: '2割特例', rate: 0.2 },
  2024: { label: '2割特例', rate: 0.2 },
  2025: { label: '2割特例', rate: 0.2 },
  2026: { label: '2割特例', rate: 0.2 },
  2027: { label: '3割特例', rate: 0.3 },
  2028: { label: '3割特例', rate: 0.3 },
};
