import type { ConsumptionTaxReliefEstimate } from '@/libs/analytics';
import { formatAmount } from '@/libs/format';
import styles from './index.module.scss';

type Props = {
  estimate: ConsumptionTaxReliefEstimate | null;
  /** 対象年。最終年かどうかの注記に使う */
  year: number;
};

/**
 * インボイス登録に伴う消費税の経過措置（2割特例・3割特例）の概算納付額。
 * 対象年が範囲外（2023〜2028年分以外）なら何も表示しない。
 * 個人事業者限定・要件ありのため、必ず確認を促す文言を添える。
 */
export default function ConsumptionTaxReliefCard({ estimate, year }: Props) {
  if (!estimate) return null;
  const { relief, amount } = estimate;

  const isFinalYear =
    (relief.label === '2割特例' && year === 2026) ||
    (relief.label === '3割特例' && year === 2028);

  return (
    <div className={styles.relief}>
      <p className={styles.relief__label}>{relief.label}による概算納付額（参考）</p>
      <p className={styles.relief__value}>
        {formatAmount(amount)}
        <span className={styles.relief__unit}>円</span>
      </p>
      <p className={styles.relief__note}>
        「税率別の内訳」の消費税額（参考）の合計 × {Math.round(relief.rate * 100)}% で概算しています。
        インボイス登録が理由で免税事業者から課税事業者になった場合などが対象で、法人は対象外です。
        届出は不要で、確定申告書への付記のみで適用できますが、要件に当てはまるか必ず確認してください。
        {isFinalYear && (
          <strong>
            　{year}年分は{relief.label}が適用できる最後の年です。
            {relief.label === '2割特例' && '翌年分からは3割特例（個人事業者限定）、'}
            簡易課税・本則課税のいずれかを選ぶ必要があります。
          </strong>
        )}
      </p>
    </div>
  );
}
