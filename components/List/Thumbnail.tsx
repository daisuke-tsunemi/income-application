import Image from 'next/image';
import type { MicroCMSImage } from '@/libs/types';
import styles from './list.module.scss';

type Props = {
  image?: MicroCMSImage;
  /** 領収書・証明書など、何の画像かが分かる代替テキスト */
  alt?: string;
  /** first view に入る行だけ eager 読み込みにして LCP を改善する */
  priority?: boolean;
};

export default function Thumbnail({ image, alt = 'サムネイル', priority = false }: Props) {
  if (!image) {
    return (
      <Image
        className={styles.img}
        src="/img/common/no-image.webp"
        alt="no-image"
        width={80}
        height={60}
        priority={priority}
      />
    );
  }

  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`${image.url}?fm=webp&fit=crop&w=80&h=60 1x, ${image.url}?fm=webp&fit=crop&w=80&h=60&dpr=2 2x`}
      />
      <img
        src={image.url}
        alt={alt}
        className={styles.img}
        width={image.width}
        height={image.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </picture>
  );
}
