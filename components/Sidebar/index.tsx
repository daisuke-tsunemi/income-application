import Image from 'next/image';
import GlobalNav from '@/components/GlobalNav';
import styles from './index.module.scss';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar__inner}>
        <Image
          src="/img/common/logo/logo_simple.webp"
          alt="ロゴ"
          className={styles.sidebar__logo}
          width={100}
          height={43}
          priority
        />
        <GlobalNav />
      </div>
    </aside>
  );
}
