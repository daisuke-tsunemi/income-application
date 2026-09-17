'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

interface GoogleTagManagerProps {
  GTM_ID: string;
}

export default function GoogleTagManager({
  GTM_ID
}: GoogleTagManagerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && typeof window !== 'undefined' && window.dataLayer) {
      // ページ遷移時にGTMに通知
      window.dataLayer.push({
        event: 'page_view',
        page_path: pathname,
      });
    }
  }, [pathname]);

  return (
    <>
      {/* Google Tag Manager スクリプト */}
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
    </>
  );
}