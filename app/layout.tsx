import Sidebar from '@/components/Sidebar';
import '@/styles/css/globals.css';
import styles from './layout.module.scss';
import { Suspense } from 'react';
import { Metadata } from 'next';
import SvgDefs from '@/components/SvgDefs';
import { montserrat, zenKaku } from '@/libs/fonts';

export const revalidate = 86400;
// キャッシュの再生成は1日間に1回（デフォは60秒に1回になっているので注意）

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL || 'https://inner-communication.vercel.app'),
  robots: 'noindex, nofollow',
  title: {
    template: '%s | 確定申告ダッシュボード',
    default: '確定申告ダッシュボード',
  },
  description:
    '個人事業主向けに、売上・源泉徴収・経費・所得控除を e-Tax へ転記できる形で集計するダッシュボードです。',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: {
      template: '%s | 確定申告ダッシュボード',
      default: '確定申告ダッシュボード',
    },
    description:
      '個人事業主向けに、売上・源泉徴収・経費・所得控除を e-Tax へ転記できる形で集計するダッシュボードです。',
    images: ['/ogp.jpg'],
    type: 'website',
    url: '/',
    locale: 'ja_JP',
    siteName: '確定申告ダッシュボード',
  },
  twitter: {
    card: 'summary_large_image',
    title: '確定申告ダッシュボード',
    description:
      '個人事業主向けに、売上・源泉徴収・経費・所得控除を e-Tax へ転記できる形で集計するダッシュボードです。',
    images: ['/twitter-image.jpg'],
  },
};

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  return (
    <html lang="ja" className={`${montserrat.variable} ${zenKaku.variable}`} data-scroll-behavior="smooth">
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <body>
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
          <SvgDefs />
          <div className={styles.wrapper}>
            <Sidebar />
            <main className={styles.main}>
              <div className={styles.wrapperContent}>
                {children}
              </div>
            </main>
          </div>
        </Suspense>
      </body>
    </html>
  );
}
