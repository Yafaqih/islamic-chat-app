// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        {/* ===== MOBILE & VIEWPORT (GARDER - IMPORTANT) ===== */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* ===== THEME & COULEURS ===== */}
        <meta name="theme-color" content="#10B981" />
        <meta name="msapplication-TileColor" content="#10B981" />

        {/* ===== SEO META TAGS ===== */}
        <meta 
          name="description" 
          content="يا فقيه - مساعدك الإسلامي الذكي | تفسير القرآن الكريم، شرح الأحاديث الصحيحة، فتاوى إسلامية، مواقيت الصلاة، اتجاه القبلة، أذكار الصباح والمساء. Ya Faqih - Assistant islamique intelligent."
        />
        <meta 
          name="keywords" 
          content="يا فقيه, مساعد إسلامي, تفسير القرآن, القرآن الكريم, أحاديث صحيحة, فتاوى إسلامية, مواقيت الصلاة, اتجاه القبلة, أذكار الصباح, أذكار المساء, دعاء, صلاة الفجر, صلاة الظهر, صلاة العصر, صلاة المغرب, صلاة العشاء, سورة الفاتحة, سورة البقرة, سورة الكهف, سورة يس, سورة الملك, التقويم الهجري, فقه إسلامي, المذاهب الأربعة, رمضان, الحج, العمرة, الزكاة, خطب الجمعة, Ya Faqih, Islamic assistant, Quran, Hadith, Fiqh, prayer times, Qibla"
        />
        <meta name="author" content="Ya Faqih" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href="https://www.yafaqih.app" />
        
        {/* ===== LANGUE ET RÉGION ===== */}
        <meta name="language" content="Arabic" />
        <meta name="geo.region" content="SA" />
        <meta name="geo.placename" content="Saudi Arabia" />
        <link rel="alternate" hrefLang="ar" href="https://www.yafaqih.app" />
        <link rel="alternate" hrefLang="fr" href="https://www.yafaqih.app" />
        <link rel="alternate" hrefLang="en" href="https://www.yafaqih.app" />
        <link rel="alternate" hrefLang="x-default" href="https://www.yafaqih.app" />

        {/* ===== OPEN GRAPH (Facebook, LinkedIn) ===== */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.yafaqih.app" />
        <meta property="og:title" content="يا فقيه | Ya Faqih - مساعدك الإسلامي الذكي" />
        <meta 
          property="og:description" 
          content="مساعد إسلامي ذكي متخصص في تفسير القرآن الكريم، شرح الأحاديث الصحيحة، الفتاوى الإسلامية، مواقيت الصلاة واتجاه القبلة."
        />
        <meta property="og:image" content="https://www.yafaqih.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Ya Faqih - يا فقيه" />
        <meta property="og:site_name" content="Ya Faqih - يا فقيه" />
        <meta property="og:locale" content="ar_SA" />
        <meta property="og:locale:alternate" content="ar_AE" />
        <meta property="og:locale:alternate" content="ar_EG" />
        <meta property="og:locale:alternate" content="fr_FR" />

        {/* ===== TWITTER CARD ===== */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.yafaqih.app" />
        <meta name="twitter:title" content="يا فقيه | Ya Faqih - مساعدك الإسلامي الذكي" />
        <meta 
          name="twitter:description" 
          content="مساعد إسلامي ذكي متخصص في تفسير القرآن الكريم، شرح الأحاديث الصحيحة، الفتاوى الإسلامية، مواقيت الصلاة واتجاه القبلة."
        />
        <meta name="twitter:image" content="https://www.yafaqih.app/og-image.png" />
        <meta name="twitter:image:alt" content="Ya Faqih - يا فقيه" />

        {/* ===== PWA ===== */}
        <meta name="application-name" content="Ya Faqih - يا فقيه" />
        <meta name="apple-mobile-web-app-title" content="يا فقيه" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* ===== FAVICONS & ICÔNES ===== */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#10B981" />

        {/* ===== SPLASH SCREENS iPhone ===== */}
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

        {/* ===== POLICES ARABES ===== */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Scheherazade+New:wght@700&display=swap"
          rel="stylesheet"
        />

        {/* ===== STRUCTURED DATA (JSON-LD) ===== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://www.yafaqih.app/#website",
                  "url": "https://www.yafaqih.app",
                  "name": "Ya Faqih - يا فقيه",
                  "description": "مساعد إسلامي ذكي متخصص في تفسير القرآن والأحاديث والفتاوى",
                  "publisher": { "@id": "https://www.yafaqih.app/#organization" },
                  "potentialAction": [{
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://www.yafaqih.app/?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }],
                  "inLanguage": ["ar", "fr", "en"]
                },
                {
                  "@type": "Organization",
                  "@id": "https://www.yafaqih.app/#organization",
                  "name": "Ya Faqih",
                  "alternateName": "يا فقيه",
                  "url": "https://www.yafaqih.app",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.yafaqih.app/logo.png",
                    "width": 400,
                    "height": 400
                  },
                  "description": "مساعد إسلامي ذكي يقدم خدمات تفسير القرآن الكريم، شرح الأحاديث النبوية، الفتاوى الإسلامية، مواقيت الصلاة واتجاه القبلة",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "email": "info@yafaqih.app",
                    "contactType": "customer service",
                    "availableLanguage": ["Arabic", "French", "English"]
                  }
                },
                {
                  "@type": "WebApplication",
                  "@id": "https://www.yafaqih.app/#webapp",
                  "name": "Ya Faqih - يا فقيه",
                  "url": "https://www.yafaqih.app",
                  "applicationCategory": "ReligiousApplication",
                  "operatingSystem": "All",
                  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
                  "featureList": [
                    "تفسير القرآن الكريم",
                    "شرح الأحاديث الصحيحة",
                    "الفتاوى الإسلامية",
                    "مواقيت الصلاة",
                    "اتجاه القبلة",
                    "أذكار الصباح والمساء",
                    "إعداد الخطب"
                  ]
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://www.yafaqih.app/#faq",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "ما هو يا فقيه؟",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "يا فقيه هو مساعد إسلامي ذكي يستخدم الذكاء الاصطناعي لمساعدة المسلمين في فهم القرآن الكريم والأحاديث الصحيحة والفقه الإسلامي."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "هل يا فقيه مجاني؟",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "نعم، يا فقيه يقدم خدمة مجانية مع خيارات مميزة للمشتركين."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "ما هي مصادر يا فقيه؟",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "يعتمد يا فقيه على القرآن الكريم والسنة النبوية الصحيحة وكتب التفسير والفقه المعتمدة عند أهل السنة والجماعة."
                      }
                    }
                  ]
                }
              ]
            })
          }}
        />

        {/* ===== GOOGLE SEARCH CONSOLE (Décommenter après vérification) ===== */}
        {/* <meta name="google-site-verification" content="VOTRE_CODE_GOOGLE" /> */}
      </Head>

      <body className="min-h-screen overflow-x-hidden bg-gradient-to-b from-islamic-dark to-black text-white antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
