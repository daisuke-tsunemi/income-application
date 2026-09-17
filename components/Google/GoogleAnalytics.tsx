'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID: string;
}

export default function GoogleAnalytics({
  GA_MEASUREMENT_ID,
}: GoogleAnalyticsProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && typeof window !== 'undefined' && window.gtag) {
      // ページ遷移時にGA4に通知
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname,
        page_location: window.location.href,
      });
    }
  }, [pathname, GA_MEASUREMENT_ID]);

  return (
    <>
      {/* Google Analytics 4 スクリプト */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  );
}