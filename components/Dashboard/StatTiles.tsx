import type { DashboardSummary } from '@/libs/analytics';
import styles from './dashboard.module.scss';

type Props = {
  summary: DashboardSummary;
};

type Tile = {
  label: string;
  value: string;
  unit?: string;
};

export default function StatTiles({ summary }: Props) {
  const tiles: Tile[] = [
    { label: '商談数', value: summary.dealCount.toLocaleString('ja-JP'), unit: '件' },
    { label: '売上金額', value: summary.salesTotal.toLocaleString('ja-JP'), unit: '円' },
    { label: '見込み金額', value: summary.estimatedTotal.toLocaleString('ja-JP'), unit: '円' },
    {
      label: '受注率',
      value: summary.wonRate === null ? '—' : summary.wonRate.toFixed(1),
      unit: summary.wonRate === null ? undefined : '%',
    },
  ];

  return (
    <div className={styles.tiles}>
      {tiles.map((tile) => (
        <div key={tile.label} className={styles.tile}>
          <p className={styles.tile__label}>{tile.label}</p>
          <p className={styles.tile__value}>
            {tile.value}
            {tile.unit && <span className={styles.tile__unit}>{tile.unit}</span>}
          </p>
        </div>
      ))}
    </div>
  );
}
