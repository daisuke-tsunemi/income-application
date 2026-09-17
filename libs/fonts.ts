// 全ページで使用するフォントを一元管理
// これにより、フォントの重複読み込みを防ぎます
import { Montserrat, Zen_Kaku_Gothic_New, Zen_Maru_Gothic } from "next/font/google";

// フォントの読み込みを最適化：
// 1. 実際に使用されているフォントウェイトのみを読み込む
// 2. preloadを無効化して、必要なフォントのみを読み込む
// 3. 日本語サブセットを追加（必要に応じて）

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-montserrat",
  preload: false,
  adjustFontFallback: true,
});

export const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-zen-kaku-gothic-new",
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});

export const zenMaru = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-zen-maru-gothic",
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});
