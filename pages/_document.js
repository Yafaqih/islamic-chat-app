// pages/_document.js

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Ya Faqih" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ya Faqih" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#10b981" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#10b981" />

        {/* Apple Splash Screens */}
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

        {/* SEO */}
        <meta name="description" content="Assistant islamique intelligent avec IA - القرآن، الأحاديث، الخطب، بوصلة القبلة، مواقيت الصلاة" />
        <meta name="keywords" content="islam, quran, hadith, prayer, qibla, islamic assistant, muslim app, قرآن, حديث, صلاة, قبلة" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="المساعد الإسلامي - Ya Faqih" />
        <meta property="og:description" content="Assistant islamique intelligent avec IA - القرآن، الأحاديث، الخطب" />
        <meta property="og:site_name" content="Ya Faqih" />
        <meta property="og:url" content="https://www.yafaqih.app" />
        <meta property="og:image" content="https://www.yafaqih.app/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="المساعد الإسلامي - Ya Faqih" />
        <meta name="twitter:description" content="Assistant islamique intelligent avec IA" />
        <meta name="twitter:image" content="https://www.yafaqih.app/og-image.png" />

        {/* Fonts (optionnel) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}