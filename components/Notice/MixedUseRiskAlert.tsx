import { formatAmount, formatDate } from '@/libs/format';
import type { Expense } from '@/libs/types';
import styles from './index.module.scss';

type Props = {
  /** 家事按分が必要になりやすい科目なのに事業割合100%・按分根拠未記入の明細 */
  expenses: Expense[];
};

/**
 * 地代家賃・水道光熱費・通信費は自宅兼事務所の場合、事業割合100%は
 * 税務調査で問われやすい典型パターン。按分の根拠が記録されていれば警告しない。
 */
export default function MixedUseRiskAlert({ expenses }: Props) {
  if (expenses.length === 0) return null;

  const total = expenses.reduce((sum, expense) => sum + (expense.amount ?? 0), 0);

  return (
    <div className={styles.alert}>
      <div className={styles.alert__head}>
        <p className="c-heading--md">家事按分が必要になりやすい科目で、事業割合100%の明細があります</p>
        <p className={`${styles.alert__count} c-txt__lg weight__700`}>
          {expenses.length.toLocaleString('ja-JP')}
          <small> 件／{formatAmount(total)} 円</small>
        </p>
      </div>
      <ul className={styles.alert__list}>
        {expenses.map((expense) => (
          <li key={expense.id} className={`${styles.alert__item} u-align wrap`}>
            <time>{formatDate(expense.date) ?? '日付未設定'}</time>
            <strong>{expense.category?.name ?? '科目未設定'}</strong>
            <span>{expense.payee ?? '支払先未設定'}</span>
            <span className={`${styles.alert__amount} u-mlAuto`}>{formatAmount(expense.amount)} 円</span>
          </li>
        ))}
      </ul>
      <p className={styles.alert__more}>
        自宅兼事務所の場合、地代家賃・水道光熱費・通信費を事業割合100%にするのは
        税務調査で問われやすい典型パターンです。実態が全額事業使用でなければ割合を見直すか、
        全額事業使用の根拠（事業専用の物件・回線であるなど）を「按分の根拠」に記録してください。
      </p>
    </div>
  );
}
