import styles from './index.module.scss';

export type BadgeTone = 'done' | 'todo' | 'note' | 'plain';

type Props = {
  tone: BadgeTone;
  children: React.ReactNode;
};

/** 状態を一目で示すラベル。色だけに頼らず必ず文言も出す */
export default function Badge({ tone, children }: Props) {
  return <span className={`${styles.badge} ${styles[`badge--${tone}`]}`}>{children}</span>;
}
