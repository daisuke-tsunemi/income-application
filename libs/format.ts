import { jst } from './datetime';

/** 未入力を表す共通ラベル */
export const EMPTY_LABEL = '未設定';

// グラフ軸用。「1.5万 / 3万」のように短く、かつ丸めで隣接ラベルが重複しない
const compactFormatter = new Intl.NumberFormat('ja-JP', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** グラフ軸ラベル向けの短縮表記 */
export const formatCompact = (value: number): string => compactFormatter.format(value);

/** 金額を「28,000」形式にする。数値化できない場合は元の文字列をそのまま返す */
export const formatPrice = (value?: string | number | null): string | null => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isNaN(num) ? String(value) : num.toLocaleString('ja-JP');
};

/** 日付を「2026.09.09」形式にする（JST 固定） */
export const formatDate = (value?: string | null): string | null =>
  value ? jst(value).format('YYYY.MM.DD') : null;

/** 日時を「2026.09.09 17:00」形式にする（JST 固定） */
export const formatDateTime = (value?: string | null): string | null =>
  value ? jst(value).format('YYYY.MM.DD HH:mm') : null;

/** セレクトフィールド（配列で返る）を「A / B」形式にする */
export const formatSelect = (value?: string[] | null): string | null =>
  value && value.length > 0 ? value.join(' / ') : null;
