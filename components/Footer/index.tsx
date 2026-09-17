import styles from './index.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={`${styles.cr} u-right`}>©2026 サイト名 All Rights Reserved.</p>
    </footer>
  );
}
