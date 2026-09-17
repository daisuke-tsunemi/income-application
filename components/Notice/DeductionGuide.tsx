import Badge from '@/components/Badge';
import { DEDUCTION_GUIDE } from '@/constants';
import styles from './index.module.scss';

type Props = {
  type: string;
};

/** 控除種別ごとの転記手順。合計をそのまま入力してよいかを最初に示す */
export default function DeductionGuide({ type }: Props) {
  const guide = DEDUCTION_GUIDE[type];
  if (!guide) return null;

  return (
    <div className={styles.guide}>
      {guide.direct ? (
        <Badge tone="done">支払額＝控除額</Badge>
      ) : (
        <Badge tone="note">要計算・区分</Badge>
      )}
      <span className={styles.guide__form}>{guide.form}</span>
      {guide.caution && <span className={styles.guide__caution}>{guide.caution}</span>}
    </div>
  );
}
