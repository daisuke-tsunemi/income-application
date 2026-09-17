import styles from './index.module.scss';

type Props = {
  /** 本システムで集計していない欄 */
  items: readonly string[];
};

/**
 * 「この画面に出てこない＝0円」という誤解を防ぐための注記。
 * 転記作業で最も起きやすい漏れなので、集計値と同じ画面に置く。
 */
export default function Coverage({ items }: Props) {
  return (
    <div className={styles.coverage}>
      <p className={styles.coverage__title}>この画面で集計していない欄</p>
      <ul className={styles.coverage__list}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className={styles.coverage__text}>
        いずれも該当があれば申告書・決算書の該当欄に別途記入が必要です。0円という意味ではありません。
      </p>
    </div>
  );
}
