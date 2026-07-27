import type { Metadata } from "next";
import "./globals-compiled.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import ChatWidget from "@/components/ChatWidget/ChatWidget";
import { SitePopup } from "@/components/SitePopup";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Script from "next/script";
import { ScrollToTopHelper } from "@/components/ScrollToTopHelper";

import { getPayload } from "payload";
import configPromise from "@payload-config";

export const revalidate = 60;

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://ecdc.ksbtdanang.vn";

export const metadata: Metadata = {
  metadataBase: new URL(serverUrl),
  title: "TRUNG TÂM KIỂM SOÁT BỆNH TẬT THÀNH PHỐ ĐÀ NẴNG",
  description: "Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng - Thông tin y tế, phòng chống dịch bệnh, an toàn thực phẩm tại thành phố Đà Nẵng.",
  manifest: "/manifest.webmanifest",
  // ── OG Tags (Fix #5) ─────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "CDC Đà Nẵng",
    title: "Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng",
    description: "Thông tin y tế, phòng chống dịch bệnh, an toàn thực phẩm tại thành phố Đà Nẵng.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "CDC Đà Nẵng - Trung tâm Kiểm soát Bệnh tật",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trung tâm Kiểm soát Bệnh tật Thành phố Đà Nẵng",
    description: "Thông tin y tế, phòng chống dịch bệnh, an toàn thực phẩm tại thành phố Đà Nẵng.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png',  sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CDC Đà Nẵng",
    startupImage: '/icon-512x512.png',
  },
  formatDetection: {
    telephone: false,
  },
};

import { Viewport } from 'next';
export const viewport: Viewport = {
  themeColor: '#007a8c',
  width: 'device-width',
  initialScale: 1,
  // FIX #4: Bỏ maximumScale:1 và userScalable:false để không bị Lighthouse penalize
  // và hỗ trợ người dùng khiếm thị có thể zoom màn hình
};

function hexToRgb(hex: string | undefined | null) {
  if (!hex) return '58, 127, 199';
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const hexFull = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexFull);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '58, 127, 199';
}

// Map font value → tên font thực tế (có dấu cách)
function fontValueToName(value: string): string {
  return value.replace(/\+/g, ' ');
}

import { draftMode } from 'next/headers';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let themeConfig: any = null;
  let popupConfig: any = null;
  let isDraftMode = false;
  try {
    const { isEnabled } = await draftMode();
    isDraftMode = isEnabled;
    const payload = await getPayload({ config: configPromise });
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 2 });
    themeConfig = (settings as any)?.themeConfig;
    popupConfig = (settings as any)?.popup;
  } catch (e) {
    console.error("Error fetching settings in layout:", e);
  }

  const primaryColor = themeConfig?.primaryColor || '#3a7fc7';
  const primaryDarkColor = themeConfig?.primaryDarkColor || '#0055a7';
  const secondaryColor = themeConfig?.secondaryColor || '#4999d6';
  const primaryRgb = hexToRgb(primaryColor);

  // Font
  const fontValue = themeConfig?.fontFamily || 'Inter';
  const fontName = fontValueToName(fontValue);
  // FIX #2: Chỉ dùng 1 thẻ stylesheet, KHÔNG preload thêm cùng URL (tránh load font 2 lần)
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontValue}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap`;

  return (
    <html lang="vi">
      <head>
        {/* Tối ưu Google Font: Load không đồng bộ để tránh render-blocking */}
        <link id="google-font-css" href={googleFontUrl} rel="stylesheet" media="print" />
        <Script id="google-font-async" strategy="afterInteractive">
          {`document.getElementById('google-font-css').media = 'all';`}
        </Script>
        <noscript>
          <link href={googleFontUrl} rel="stylesheet" />
        </noscript>

        {/* Không preload ảnh nền header ở đây — Next.js sẽ tự thêm từ component Header
           Preload thủ công ở đây gây duplicate với tag Next.js inject sau */}

        {/* CSS variables: màu sắc + font chữ */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${primaryColor};
              --primary-dark: ${primaryDarkColor};
              --secondary: ${secondaryColor};
              --primary-rgb: ${primaryRgb};
              --font-family: '${fontName}', system-ui, -apple-system, sans-serif;
            }
          `
        }} />
        <Script id="pwa-init" strategy="afterInteractive">
          {`
            window.deferredPrompt = null;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              window.deferredPrompt = e;
            });
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>
        {/* Auto-reload khi Server Action ID lỗi do deploy mới */}
        <Script id="server-action-reload" strategy="afterInteractive">
          {`
            window.addEventListener('error', function(e) {
              if (e.message && e.message.includes('Failed to find Server Action')) {
                console.warn('[Deploy] Server Action cũ — tự động reload trang...');
                window.location.reload();
              }
            });
            window.addEventListener('unhandledrejection', function(e) {
              if (e.reason && e.reason.message && e.reason.message.includes('Failed to find Server Action')) {
                console.warn('[Deploy] Server Action cũ — tự động reload trang...');
                e.preventDefault();
                window.location.reload();
              }
            });
          `}
        </Script>
      </head>
      <body className="bg-gray-100/80 antialiased selection:bg-teal-600 selection:text-white">
        <ScrollToTopHelper />
        <div className="w-full bg-white min-h-screen shadow-2xl flex flex-col overflow-x-clip relative">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        
        <BackToTop />
        <ChatWidget />
        {!isDraftMode && <SitePopup popupConfig={popupConfig} />}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
