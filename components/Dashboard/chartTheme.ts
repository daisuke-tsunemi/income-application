/**
 * チャート用カラートークン。
 * カード面 #f1f4f7 に対して validate_palette.js で検証済み（light モード）。
 * - categorical 2 slot: 全チェック PASS（series2 のみ 2.9:1 で contrast WARN
 *   → 各チャートにテーブルビューを同梱して緩和している）
 * - ordinal ramp 2〜5 段: 全チェック PASS
 * 値を変える場合は必ず validator を再実行すること。
 */

/** チャートの描画面（カード背景と同色） */
export const SURFACE = '#f1f4f7';

/** カテゴリカル（系列の識別） */
export const SERIES = {
  sales: '#00a849',
  estimated: '#ea5115',
} as const;

/** 序数ランプ（パイプライン段階の順序を明度で表す） */
export const ORDINAL_RAMP = ['#5f9de9', '#2178e3', '#1c6cce', '#0d4793', '#002c65'] as const;

/** パイプライン外のステータス */
export const NEUTRAL = '#898781';

/** 文字・罫線（系列色は文字に使わない） */
export const INK = {
  primary: '#0b0b0b',
  secondary: '#52514e',
  muted: '#898781',
  grid: '#e1e0d9',
  axis: '#c3c2b7',
} as const;

/** 段数に応じてランプを等間隔に割り当てる */
export const ordinalColor = (index: number, total: number): string => {
  if (total <= 1) return ORDINAL_RAMP[ORDINAL_RAMP.length - 1];
  const step = Math.round((index / (total - 1)) * (ORDINAL_RAMP.length - 1));
  return ORDINAL_RAMP[step];
};

/** マーク仕様（marks-and-anatomy 準拠） */
export const MARK = {
  /** バーの最大太さ */
  barSize: 24,
  /** データ端の角丸 */
  barRadius: 4,
  /** 線の太さ */
  lineWidth: 2,
  /** 面の塗りを分ける余白 */
  surfaceGap: 2,
} as const;
