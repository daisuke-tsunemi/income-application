import type { Dayjs } from 'dayjs';
import { jstNow } from './datetime';
import { YEAR_OPTIONS_COUNT } from '@/constants';

/**
 * 確定申告の集計単位は暦年（1/1〜12/31）で固定する。
 * 月単位の期間指定は申告書に転記する数字と噛み合わないため用意しない。
 */
export type Period = {
  year: number;
  /** 対象年の 1/1 0:00（JST） */
  start: Dayjs;
  /** 対象年の 12/31 23:59:59.999（JST） */
  end: Dayjs;
  /** 「2026年分」形式の表示用ラベル */
  label: string;
  /** microCMS の filters に渡す date の範囲条件 */
  filters: string;
};

/** 何も指定が無いときの対象年 */
export const defaultYear = (): number => jstNow().year();

/** プルダウンに並べる年（新しい順） */
export const yearOptions = (): number[] => {
  const latest = defaultYear();
  return Array.from({ length: YEAR_OPTIONS_COUNT }, (_, index) => latest - index);
};

/** URL クエリの年を数値に正規化する（不正値は当年にフォールバック） */
export const parseYear = (year?: string): number => {
  const parsed = Number(year);
  const options = yearOptions();
  return options.includes(parsed) ? parsed : defaultYear();
};

/** 対象年から集計期間を組み立てる */
export const buildPeriod = (year?: string): Period => {
  const target = parseYear(year);
  const start = jstNow().year(target).startOf('year');
  const end = start.endOf('year');

  // microCMS の greater_than / less_than は境界を含まないため、前後に1ミリ秒ずらす
  const after = start.subtract(1, 'millisecond').toISOString();
  const before = end.add(1, 'millisecond').toISOString();

  return {
    year: target,
    start,
    end,
    label: `${target}年分`,
    filters: `date[greater_than]${after}[and]date[less_than]${before}`,
  };
};
