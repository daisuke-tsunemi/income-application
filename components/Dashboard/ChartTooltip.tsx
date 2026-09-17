'use client';

import { INK } from './chartTheme';
import styles from './dashboard.module.scss';

export type TooltipRow = {
  /** 系列色。ライン風のキーとして短い線で表示する */
  color: string;
  name: string;
  value: string;
};

type Props = {
  title: string;
  rows: TooltipRow[];
};

/** 値が主・系列名が従。名前は API 由来のためテキストノードとして描画する */
export default function ChartTooltip({ title, rows }: Props) {
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltip__title}>{title}</p>
      {rows.map((row) => (
        <p key={row.name} className={styles.tooltip__row}>
          <span
            className={styles.tooltip__key}
            style={{ backgroundColor: row.color }}
            aria-hidden="true"
          />
          <span className={styles.tooltip__value}>{row.value}</span>
          <span className={styles.tooltip__name} style={{ color: INK.secondary }}>
            {row.name}
          </span>
        </p>
      ))}
    </div>
  );
}
