import Link from 'next/link';
import { formatAmount, formatDate } from '@/libs/format';
import type { Income } from '@/libs/types';
import { UNVERIFIED_ALERT_LIMIT } from '@/constants';
import styles from './index.module.scss';

type Props = {
  /** is_verified === false の売上（呼び出し側で絞り込み済み） */
  incomes: Income[];
  /** 「一覧を見る」の遷移先。同じページ内で使うときは省略する */
  href?: string;
};

/** 支払調書との突合が済んでいない売上を促す */
export default function UnverifiedAlert({ incomes, href }: Props) {
  if (incomes.length === 0) {
    return (
      <div className={`${styles.alert} ${styles['alert--clear']}`}>
        <p className={styles.alert__done}>
          支払調書との突合は完了しています（未確認 0 件）。
        </p>
      </div>
    );
  }

  const shown = incomes.slice(0, UNVERIFIED_ALERT_LIMIT);
  const rest = incomes.length - shown.length;

  return (
    <div className={styles.alert}>
      <div className={styles.alert__head}>
        <p className={styles.alert__title}>支払調書と未突合の売上があります</p>
        <p className={styles.alert__count}>{incomes.length.toLocaleString('ja-JP')} 件</p>
        {href && (
          <Link href={href} className="c-txt__xs color__primary u-mlAuto">
            一覧で確認する
          </Link>
        )}
      </div>
      <ul className={styles.alert__list}>
        {shown.map((income) => (
          <li key={income.id} className={styles.alert__item}>
            <time>{formatDate(income.date) ?? '日付未設定'}</time>
            <strong>{income.client?.name ?? '取引先未設定'}</strong>
            <span className={styles.alert__amount}>
              {formatAmount(income.amount)} 円
              {(income.tax_withheld ?? 0) > 0 && (
                <>（源泉 {formatAmount(income.tax_withheld)} 円）</>
              )}
            </span>
          </li>
        ))}
      </ul>
      {rest > 0 && (
        <p className={styles.alert__more}>ほか {rest.toLocaleString('ja-JP')} 件</p>
      )}
    </div>
  );
}
