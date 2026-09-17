# 商談・案件管理ダッシュボード（microCMS テンプレート）

microCMS をデータベースとして使う、**社内向けの商談・案件管理ダッシュボード**のテンプレートです。

「ブログ・コーポレートサイト」ではなく、**業務データを見るための管理画面**をヘッドレス CMS で組む、という使い方に振り切っています。microCMS の管理画面をそのまま入力 UI として使い、フロントは閲覧・集計に専念する構成です。

<!-- TODO: スクリーンショット（ダッシュボード / 一覧 / 詳細）を差し込む -->

## 何ができるか

| 画面 | 内容 |
| --- | --- |
| ダッシュボード | KPI 4指標（商談数／売上金額／見込み金額／受注率）＋ 3グラフ（月別推移・ステータス別・担当者別）。集計の起点月を指定可能 |
| 商談・案件 | 一覧（キーワード検索・担当者フィルタ・ページング）／詳細（関連する活動履歴をページング表示） |
| 活動履歴 | 一覧／詳細。商談に紐づく訪問・提案などの記録 |
| 顧客 | 一覧／詳細。その顧客の商談を一覧表示 |
| 商材・サービス | 一覧／詳細。そのサービスの商談を一覧表示 |
| 自社担当者 | 一覧／詳細。その担当者の商談を一覧表示 |

5つの API が相互に参照し合い、**どの画面からでも関連データを辿れる**のが特徴です。顧客 → 商談 → 活動履歴、担当者 → 担当案件、といった導線がひと通り繋がっています。

## 技術構成

- **Next.js 16**（App Router / Server Components）
- **React 19** / **TypeScript 5**
- **Sass Modules**（CSS フレームワーク非依存）
- **Recharts 3**（グラフ）
- **microcms-js-sdk**
- ホスティング: **Vercel**

## セットアップ

### 前提条件

- **Node.js 18.17 以上** / **npm 9 以上**
- **microCMS アカウント**（無料プランで利用可能）
- **GitHub アカウント**（Vercel へのデプロイ時に必要）

### 1. microCMS 側の準備

#### 1-1. microCMS でテンプレートから API を生成

1. [microCMS](https://microcms.io) にログインして、ダッシュボードにアクセス
2. 新規ワークスペース / プロジェクトを作成
3. **「テンプレート」タブから本テンプレート（商談管理）を選択**して生成
4. 以下の API が自動生成されます：

| API ID | 種類 | 主なフィールド |
| --- | --- | --- |
| `deals` | リスト | title, eyecatch, content, customer（参照）, service（参照）, employee（複数参照）, status（セレクト）, estimated（数値）, sales（数値） |
| `activities` | リスト | activity-title, deals（参照）, activatedAt（日時）, activity-content, activity-next |
| `customers` | リスト | name, person, priority（セレクト）, address, tel, mail, note |
| `services` | リスト | service-name, service-price, service-thumbnail |
| `employees` | リスト | name, thumbnail, profile |

#### 1-2. API キーを取得

1. microCMS の**設定 → API キー**を開く
2. **本番用 API キー** をコピーして保管

### 2. ローカル環境の構築

#### 2-1. リポジトリをクローン

```bash
git clone https://github.com/your-username/cms-on-vercel.git
cd cms-on-vercel
npm install
```

#### 2-2. 環境変数を設定

リポジトリのルートに `.env.local` ファイルを作成します：

```bash
MICROCMS_SERVICE_DOMAIN=xxxxx   # https://xxxxx.microcms.io の xxxxx
MICROCMS_API_KEY=xxxxxxxxxx     # microCMS の API キー（1-2 で取得）
BASE_URL=http://localhost:3000  # ローカル開発時は localhost でも可
```

> **API キーの扱い**：`.env.local` は Git でコミットしないようにしてください（`.gitignore` に含まれています）

#### 2-3. ローカルで起動して動作確認

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、以下が表示されることを確認：
- **ダッシュボード**：KPI グラフ（データが無い場合は 0 表示）
- **ナビゲーション**：サイドメニューが表示
- **API 連携**：microCMS からデータが正常に取得できる

> microCMS にまだデータがない場合、一覧は空の状態で表示されます。[microCMS の管理画面](https://app.microcms.io)からテストデータを追加してください。

### 3. 本番環境への デプロイ（Vercel）

#### 3-1. GitHub にプッシュ

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 3-2. Vercel にデプロイ

1. [Vercel](https://vercel.com) でサインアップ / ログイン
2. **「新規プロジェクト」→ GitHub リポジトリをインポート**
3. **環境変数を設定**：
   - `MICROCMS_SERVICE_DOMAIN`
   - `MICROCMS_API_KEY`
   - `BASE_URL=https://your-domain.vercel.app`（またはカスタムドメイン）
4. **デプロイ** をクリック

#### 3-3. 本番環境で動作確認

デプロイ完了後、Vercel が提供するプレビュー URL にアクセスして動作確認

### 4. 本番ビルド（ローカルで実行する場合）

```bash
npm run build
npm run start
```

## カスタマイズの入口

用途に合わせて変えることが多い箇所をまとめています。

| やりたいこと | 触る場所 |
| --- | --- |
| ステータスの選択肢を変える | microCMS の `status` フィールド ＋ [`constants/index.ts`](constants/index.ts) の `DEAL_STATUS_ORDER`（パイプラインの並び順と色の濃さに対応） |
| 1ページの表示件数 | [`constants/index.ts`](constants/index.ts) の `LIMIT` |
| ダッシュボードの表示月数 | [`constants/index.ts`](constants/index.ts) の `DASHBOARD_MONTHS` |
| グラフの配色 | [`components/Dashboard/chartTheme.ts`](components/Dashboard/chartTheme.ts) |
| 集計ロジック | [`libs/analytics.ts`](libs/analytics.ts)（副作用のない純関数のみ） |
| サイドメニューの項目 | [`components/GlobalNav/index.tsx`](components/GlobalNav/index.tsx) の `NAV_ITEMS` |

一覧画面は [`components/List/`](components/List/) の `DataTable` / `SearchBox` / `Pagination` を共有しているため、**API を1つ増やす際は「列定義とページ」を足すだけ**で同じ操作感の画面が作れます。

## 設計上のポイント

テンプレートを土台に開発を進める際、把握しておくと早い点です。

- **絞り込み・ページングはすべてサーバーサイド**。microCMS の `filters` / `offset` / `limit` / `q` に委譲しているため、データが数千件に増えても表示件数分しか取得しません。
- **日付は JST 固定**（[`libs/datetime.ts`](libs/datetime.ts)）。Vercel のサーバー TZ は UTC のため、素の `dayjs()` だと月初 0:00〜9:00 の商談が前月に集計されます。
- **グラフは値をツールチップに閉じ込めない**。各グラフに「数値で見る」テーブルを併設し、色覚多様性・スクリーンリーダー・印刷のいずれでも値が読めるようにしています。配色も色覚シミュレーション上の識別性を検証済みです。
- **データ0件でも壊れない**。空状態の表示とゼロ埋めした月次軸を用意しています。

---

## 以下拡張開発例

テンプレートは「商談を登録して、集計を眺める」ところまでを実装しています。実運用に乗せるとき、次に必要になりやすいのは以下です。いずれも現状のコードからの延長で実装できる粒度で並べています。

### 下書きプレビュー

microCMS の画面から「公開前の内容」を確認できるようにします。

[`proxy.ts`](proxy.ts) に `dk`（draftKey）付きリクエストのキャッシュ抑止だけが入っており、**取得側は未実装**です。`getContent` に `draftKey` を渡し、プレビュー用の表示（下書きバッジなど）を足すのが次の一手になります。

### ログイン・権限管理

現状は URL を知っていれば誰でも閲覧できます。社内利用なら、

- Vercel の Password Protection（最小構成）
- Auth.js + Google Workspace / Entra ID による SSO
- 「担当者は自分の案件だけ」といったロール別の出し分け

あたりが現実的な選択肢です。ロール別の出し分けまで行う場合、`employees` とログインユーザーの紐付け設計が要点になります。

### 画面からのデータ入力・ステータス更新

microCMS の管理画面を使わず、ダッシュボードから直接ステータスを変えたい、活動履歴を追記したい、というのは頻出の要望です。microCMS の **Write API** を Server Actions 経由で叩く構成にすると、閲覧専用から「業務が回る画面」に変わります。

### 通知・リマインド

- 商談が「受注」になったら Slack へ通知
- 次回活動予定（`activity-next`）の期日が近い案件を朝会前に通知
- 一定期間動きのない案件の洗い出し

microCMS の Webhook と Vercel Cron を組み合わせると、追加のサーバーなしで実装できます。

### 集計の高度化

現状の集計は意図的に単純化しています。実務に合わせるなら、

- **売上の計上基準** — 現在は商談の公開日（`publishedAt`）基準です。受注日フィールドを追加して、そちらで集計するのが正確です。
- **複数担当の按分** — 現在は複数担当の案件を各担当に満額計上しています（そのため担当者別の合計は総売上と一致しません）。按分率フィールドの追加や、主担当／副担当の区別で解決できます。
- **予実管理** — 目標値の API を追加して、達成率・着地見込みを出す。
- **粒度の追加** — 週次・四半期・年度、前年同期比など。

### 検索の強化

microCMS の全文検索（`q`）は**参照先フィールドを検索対象に含みません**。そのため「顧客名で商談を検索」は現状できず、顧客詳細ページから辿る導線で代替しています。

商談側に顧客名を持たせる、あるいは外部検索エンジン（Algolia / Meilisearch 等）へ同期する、といった設計判断が必要になる部分です。

### エクスポート・帳票

一覧や集計結果の CSV / Excel 出力、見積書・提案書の PDF 生成など。「結局 Excel に落として使う」を前提にした業務では効果が大きい部分です。

### 別業種への転用

データモデル（`deals` / `customers` / `services` / `employees` / `activities`）は商談管理に限定されません。

- 案件 → **プロジェクト**、活動履歴 → **作業ログ**：受託管理ツール
- 顧客 → **入居者**、商材 → **物件**：不動産管理ツール
- 顧客 → **患者・会員**、活動履歴 → **来店記録**：店舗・サロン管理ツール

呼び名とフィールドを差し替えるだけで、かなりの範囲に流用できます。

---

## 開発のご相談

上記のような拡張開発、および **react, Next.jsに限らず、LaravelなどのPHPフレームワークを使ったサイト・業務システムの開発全般**を承っています。

- テンプレートをベースにした自社向けカスタマイズ
- 認証・権限管理、入力機能ほか外部サービス連携の追加
- 既存ワークフローのシステムリニューアル
- Webサイト制作、業務システム開発、保守運用

「どこから手を付けるべきか」「この要件は現実的か」といった段階のご相談でも構いません。

**▶ [お問い合わせはこちら（株式会社創新ラボ）](https://soushin-lab.co.jp/contact)**

---

## ライセンス

MIT License
