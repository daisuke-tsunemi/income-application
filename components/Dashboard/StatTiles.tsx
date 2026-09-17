import styles from './dashboard.module.scss';

export type Tile = {
  label: string;
  value: string;
  unit?: string;
  /** どの申告書のどこに使う数字か、といった補足 */
  note?: string;
  /** 対応が必要な数字（未入金・未確認など）を目立たせる */
  alert?: boolean;
};

type Props = {
  tiles: Tile[];
};

export default function StatTiles({ tiles }: Props) {
  return (
    <div className={styles.tiles}>
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={`c-heading--sm u-mb8 ${styles.tile} ${tile.alert ? styles['tile--alert'] : ''}`}
        >
          <p className={styles.tile__label}>{tile.label}</p>
          <p className={styles.tile__value}>
            {tile.value}
            {tile.unit && <span className={styles.tile__unit}>{tile.unit}</span>}
          </p>
          {tile.note && <p className={`${styles.tile__note} c-txt__sm u-mt8`}>{tile.note}</p>}
        </div>
      ))}
    </div>
  );
}
