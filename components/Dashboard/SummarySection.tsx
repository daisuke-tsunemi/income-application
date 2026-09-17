import styles from './dashboard.module.scss';

type Props = {
  title: string;
  /** 何のための表か（どの様式のどこに転記するか）を1行で */
  note?: string;
  /** 申告書に転記する合計値。表の下に強調表示する */
  total?: {
    label: string;
    value: number;
    unit?: string;
  };
  children: React.ReactNode;
};

/** 見出し・表・合計行をまとめた集計セクション */
export default function SummarySection({ title, note, total, children }: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.section__head}>
        <h2 className="c-heading--md">{title}</h2>
        {note && <p className={styles.section__note}>{note}</p>}
      </div>
      {children}
      {total && (
        <p className={styles.total}>
          <span className={styles.total__label}>{total.label}</span>
          <span className={styles.total__value}>{total.value.toLocaleString('ja-JP')}</span>
          <span className={styles.total__unit}>{total.unit ?? '円'}</span>
        </p>
      )}
    </section>
  );
}
