import styles from './index.module.scss';

type Props = {
  title: string;
};

export default function Header({ title }: Props) {
  return (
    <header className={styles.header}>
      <h1 className='c-heading--lg'>{title}</h1>
    </header>
  );
}
