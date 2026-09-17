// GTM用の型定義
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";

export const IS_GTM = GTM_ID !== "";

// ページビュー送信（GTM用）
export const pageview = (path: string) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_path: path,
    });
  }
};

// カスタムイベント送信（GTM用）
export const event = ({
  event_name,
  event_employee,
  event_label,
  value,
  custom_parameters,
}: {
  event_name: string;
  event_employee?: string;
  event_label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: event_name,
      event_employee,
      event_label,
      value,
      ...custom_parameters,
    });
  }
};
