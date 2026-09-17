import styles from './index.module.scss';

type Props = {
  /** ページ固有の補足（どの申告書のどこに転記するか） */
  children?: React.ReactNode;
};

/**
 * 全ページ共通の但し書き。
 * 本システムは e-Tax への転記用に数字を集計するだけで、複式簿記の帳簿ではない。
 */
export default function Notice({ children }: Props) {
  return (
    <div className={styles.notice}>
      <svg className={styles.notice__icon} aria-hidden="true">
        <use href="#check_circle" />
      </svg>
      <div className={styles.notice__body}>
        <p className={styles.notice__title}>
          このシステムは e-Tax への「転記用」の集計ツールです
        </p>
        <p className={styles.notice__text}>
          日々の記録を確定申告の様式どおりに合計して表示するだけのもので、法定帳簿として必要な
          複式簿記（借方・貸方の仕訳）の代わりにはなりません。青色申告特別控除（65万円・55万円）の
          適用には、別途、正規の簿記による帳簿の作成・保存が必要です。
          {children && <> {children}</>}
        </p>
      </div>
    </div>
  );
}
