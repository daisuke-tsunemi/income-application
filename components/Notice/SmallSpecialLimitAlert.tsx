import { SMALL_SPECIAL_ANNUAL_LIMIT } from '@/constants';
import { formatAmount } from '@/libs/format';
import type { AssetGroup } from '@/libs/analytics';
import styles from './index.module.scss';

type Props = {
  /** 少額減価償却資産の特例の対象額が上限を超えている場合のみ渡す */
  overLimit: { group: AssetGroup; overBy: number } | null;
};

/**
 * 少額減価償却資産の特例（措法28の2）は年間合計300万円が上限。
 * 超えている場合、どの資産を特例の対象にするかは任意に選べるため、対象を選び直す必要がある。
 */
export default function SmallSpecialLimitAlert({ overLimit }: Props) {
  if (!overLimit) return null;
  const { group, overBy } = overLimit;

  return (
    <div className={styles.alert}>
      <div className={styles.alert__head}>
        <p className="c-heading--md">
          少額減価償却資産の特例が年間上限（{formatAmount(SMALL_SPECIAL_ANNUAL_LIMIT)} 円）を超えています
        </p>
      </div>
      <p className={`${styles.alert__count} c-txt__sm`}>
        現在の対象額の合計は <strong>{formatAmount(group.businessAmount)} 円</strong>（{group.count.toLocaleString('ja-JP')} 件）で、
        上限を <strong className="c-txt--alert">{formatAmount(overBy)} 円</strong> 超えています。
      </p>
      <p className={styles.alert__more}>
        超過分は特例の対象にできません。どの資産を特例の対象にするかは任意に選べるため、
        資産の一部を通常の減価償却（耐用年数に応じた償却）に切り替えて、対象額の合計が
        {formatAmount(SMALL_SPECIAL_ANNUAL_LIMIT)} 円以内に収まるよう microCMS の「経費区分」を見直してください。
      </p>
    </div>
  );
}
