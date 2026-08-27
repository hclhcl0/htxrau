import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { SitePopup } from "@/components/SitePopup";
import Script from "next/script";
import { ScrollToTopHelper } from "@/components/ScrollToTopHelper";
import { VisitTracker } from "@/components/VisitTracker";

import { getPayload } from "payload";
import configPromise from "@payload-config";

export const revalidate = 60;

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(serverUrl),
  title: {
    template: "%s | HTX RAU AN TOÀN TÚY LOAN",
    default: "HTX RAU AN TOÀN TÚY LOAN - Vùng Chuyên Canh Rau Sạch VietGAP Đà Nẵng",
  },
  description: "Hợp tác xã Dịch vụ Sản xuất & Tiêu thụ Rau an toàn Túy Loan. Cung cấp rau củ quả tươi sạch an toàn chuẩn VietGAP & OCOP Đà Nẵng, thu hoạch mỗi sớm và giao tận nơi.",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "HTX Rau An Toàn Túy Loan",
    title: "HTX RAU AN TOÀN TÚY LOAN - Nông Sản Sạch Chuẩn VietGAP",
    description: "Chuyên cung cấp rau củ quả tươi sạch an toàn chuẩn VietGAP & OCOP Túy Loan, thu hoạch trong ngày và giao tận nơi cho gia đình, nhà hàng, bếp ăn tập thể.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "HTX Rau An Toàn Túy Loan - Nông Sản Sạch VietGAP",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HTX RAU AN TOÀN TÚY LOAN - Nông Sản Sạch VietGAP",
    description: "Chuyên cung cấp rau củ quả tươi sạch an toàn chuẩn VietGAP & OCOP Túy Loan.",
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
  formatDetection: {
    telephone: false,
  },
};

import { Viewport } from 'next';
export const viewport: Viewport = {
  themeColor: '#15803d',
  width: 'device-width',
  initialScale: 1,
};

function hexToRgb(hex: string | undefined | null) {
  if (!hex) return '21, 128, 61';
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const hexFull = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexFull);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '21, 128, 61';
}

// Map font value → tên font thực tế (có dấu cách)
function fontValueToName(value: string): string {
  return value.replace(/\+/g, ' ');
}

import { draftMode } from 'next/headers';
import { unstable_cache } from 'next/cache';

const getCachedSiteSettings = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise });
    return payload.findGlobal({ slug: 'site-settings', depth: 2 });
  },
  ['site-settings-layout'],
  { revalidate: 60, tags: ['site-settings'] }
);

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
    const settings = await getCachedSiteSettings();
    themeConfig = (settings as any)?.themeConfig;
    popupConfig = (settings as any)?.popup;
  } catch (e) {
    console.error("Error fetching settings in layout:", e);
  }

  const primaryColor = themeConfig?.primaryColor || '#15803d';
  const primaryDarkColor = themeConfig?.primaryDarkColor || '#14532d';
  const secondaryColor = themeConfig?.secondaryColor || '#16a34a';
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
        <Script id="sw-cleanup" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(regs) {
                for (var r of regs) { r.unregister(); }
              });
              if ('caches' in window) {
                caches.keys().then(function(keys) {
                  for (var k of keys) { caches.delete(k); }
                });
              }
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
        {/* Google Analytics 4 */}
        <Script
          id="ga4-script"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-LPF1GV6VFQ"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LPF1GV6VFQ', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className="bg-gray-100/80 antialiased selection:bg-emerald-600 selection:text-white">
        <ScrollToTopHelper />
        <div className="w-full bg-white min-h-screen shadow-2xl flex flex-col overflow-x-clip relative">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        
        <BackToTop />
        {!isDraftMode && <SitePopup popupConfig={popupConfig} />}
        <VisitTracker />
      </body>
    </html>
  );
}
