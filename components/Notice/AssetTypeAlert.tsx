import { DEPRECIABLE_THRESHOLD } from '@/constants';
import { formatAmount, formatDate } from '@/libs/format';
import type { Expense } from '@/libs/types';
import styles from './index.module.scss';

type Props = {
  /** 10万円以上なのに経費区分が「経費」のままの明細 */
  expenses: Expense[];
};

/**
 * 経費区分の設定漏れは必要経費の過大計上に直結する。
 * 集計値と同じ画面で、どの明細を確認すべきか名指しする。
 */
export default function AssetTypeAlert({ expenses }: Props) {
  if (expenses.length === 0) return null;

  const total = expenses.reduce((sum, expense) => sum + (expense.amount ?? 0), 0);

  return (
    <div className={styles.alert}>
      <div className={styles.alert__head}>
        <p className={styles.alert__title}>
          {formatAmount(DEPRECIABLE_THRESHOLD)} 円以上なのに経費区分が「経費」のままの明細があります
        </p>
        <p className={styles.alert__count}>
          {expenses.length.toLocaleString('ja-JP')} 件／{formatAmount(total)} 円
        </p>
      </div>
      <ul className={styles.alert__list}>
        {expenses.map((expense) => (
          <li key={expense.id} className={styles.alert__item}>
            <time>{formatDate(expense.date) ?? '日付未設定'}</time>
            <strong>{expense.category?.name ?? '科目未設定'}</strong>
            <span>{expense.payee ?? '支払先未設定'}</span>
            <span className={styles.alert__amount}>{formatAmount(expense.amount)} 円</span>
          </li>
        ))}
      </ul>
      <p className={styles.alert__more}>
        資産にあたるものは microCMS の「経費区分」を設定し直してください。現在これらは全額が経費計に入っています。
        消耗品のまとめ買いなど、資産でなければ「経費（10万円未満）」のままで構いません。
      </p>
    </div>
  );
}
