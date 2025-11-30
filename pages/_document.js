// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        {/* === CORRECTION FINALE MOBILE 2025 (iPhone + Chrome + Safari) === */}
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#006400" />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="يا فقيه" />
        <meta name="apple-mobile-web-app-title" content="يا فقيه" />
        <meta name="format-detection" content="telephone=no" />

        {/* Manifest & Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#006400" />

        {/* Splash Screens iPhone */}
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash-iphone-14-pro-max.png"
        />
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
          href="/splash-iphone-14-pro.png"
        />

        {/* SEO & OG */}
        <meta name="description" content="Assistant islamique intelligent avec IA - القرآن، الأحاديث، الخطب، بوصلة القبلة، مواقيت الصلاة" />
        <meta property="og:title" content="يا فقيه - المساعد الإسلامي الذكي" />
        <meta property="og:description" content="فتوى، تفسير، خطبة، بوصلة، مواقيت الصلاة - كل شيء في تطبيق واحد" />
        <meta property="og:image" content="https://yafaqih.app/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Police arabe */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&family=Scheherazade+New:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* Body propre + overflow caché */}
      <body className="min-h-screen bg-gradient-to-b from-islamic-dark to-black text-white overflow-x-hidden antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}