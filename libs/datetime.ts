import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 日付の区切りは日本時間で固定する。
 * 素の dayjs() はサーバーのタイムゾーン依存で、Vercel は UTC のため、
 * そのままだと月初 0:00〜9:00(JST) の商談が前月に集計されてしまう。
 */
export const TIME_ZONE = 'Asia/Tokyo';

/** ISO 文字列などを JST として扱う */
export const jst = (value?: string | number | Date) => dayjs(value).tz(TIME_ZONE);

/** "YYYY-MM" を JST のその月の1日として扱う */
export const jstMonth = (month: string) => dayjs.tz(`${month}-01`, TIME_ZONE);

/** 現在時刻（JST） */
export const jstNow = () => dayjs().tz(TIME_ZONE);
