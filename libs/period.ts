import type { Dayjs } from 'dayjs';
import { jstMonth, jstNow } from './datetime';
import { DASHBOARD_MONTHS } from '@/constants';

/** input[type=month] が扱う YYYY-MM 形式 */
const MONTH_FORMAT = 'YYYY-MM';

// dayjs の strict パースはプラグインが要るため、形式は正規表現で検証する
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export type Period = {
  /** 起点月の初日 0:00（JST） */
  start: Dayjs;
  /** 終了月の末日 23:59:59.999（JST） */
  end: Dayjs;
  /** input[type=month] の value */
  startValue: string;
  /** 「2025.10 〜 2026.09」形式の表示用ラベル */
  label: string;
  /** microCMS の filters に渡す publishedAt の範囲条件 */
  filters: string;
};

/** 何も指定が無いときの起点（今月が最終月になるように遡る） */
export const defaultStartMonth = (): string =>
  jstNow().startOf('month').subtract(DASHBOARD_MONTHS - 1, 'month').format(MONTH_FORMAT);

/**
 * URL クエリの YYYY-MM を起点月として期間を組み立てる。
 * 未指定・不正な値は既定の起点にフォールバックする。
 */
export const buildPeriod = (startMonth?: string, months = DASHBOARD_MONTHS): Period => {
  const value = startMonth && MONTH_PATTERN.test(startMonth) ? startMonth : defaultStartMonth();
  const start = jstMonth(value).startOf('month');
  const end = start.add(months - 1, 'month').endOf('month');

  // microCMS の greater_than / less_than は境界を含まないため、前後に1ミリ秒ずらす
  const after = start.subtract(1, 'millisecond').toISOString();
  const before = end.add(1, 'millisecond').toISOString();

  return {
    start,
    end,
    startValue: start.format(MONTH_FORMAT),
    label: `${start.format('YYYY.MM')} 〜 ${end.format('YYYY.MM')}`,
    filters: `publishedAt[greater_than]${after}[and]publishedAt[less_than]${before}`,
  };
};
