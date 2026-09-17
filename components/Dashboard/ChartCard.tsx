import styles from './dashboard.module.scss';

type Props = {
  title: string;
  note?: string;
  children: React.ReactNode;
  /** ツールチップに頼らず値を読めるようにするテーブルビュー（必須） */
  table: React.ReactNode;
};

export default function ChartCard({ title, note, children, table }: Props) {
  return (
    <section className={styles.card}>
      <div className="u-mb16">
        <h2 className="c-heading--md">{title}</h2>
        {note && <p className='c-txt__xs color__70'>{note}</p>}
      </div>
      {children}
      <details className={styles.card__table}>
        <summary>数値で見る</summary>
        <div className={styles.card__tableBody}>{table}</div>
      </details>
    </section>
  );
}
