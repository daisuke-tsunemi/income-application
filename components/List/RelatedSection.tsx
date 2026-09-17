import Pagination from './Pagination';
import styles from '@/app/detail.module.scss';

type Props = {
  title: string;
  /** 絞り込み後の総件数 */
  totalCount: number;
  currentPage: number;
  children: React.ReactNode;
};

/** 詳細ページ内の関連リスト。見出し・件数・ページャをまとめて扱う */
export default function RelatedSection({ title, totalCount, currentPage, children }: Props) {
  return (
    <section className={styles.content}>
      <div className="u-align wrap between u-gap8">
        <h3>{title}</h3>
        <p className="c-txt__sm">
          全 <strong className='c-heading--xl'>{totalCount.toLocaleString('ja-JP')}</strong> 件
        </p>
      </div>
      {children}
      <Pagination totalCount={totalCount} currentPage={currentPage} />
    </section>
  );
}
