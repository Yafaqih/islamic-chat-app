/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Variables d'environnement LemonSqueezy
  env: {
    NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID: process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
    NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_VARIANT_ID: process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID,
  },

  // ⚠️ CACHE DÉSACTIVÉ TEMPORAIREMENT - À SUPPRIMER POUR LA PRODUCTION
  generateEtags: false,
  
  // Headers pour désactiver le cache
  async headers() {
    return [
      {
        // Toutes les pages
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        // APIs
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig


/*
==========================================
🚀 VERSION PRODUCTION - À RESTAURER PLUS TARD
==========================================

const nextConfig = {
  reactStrictMode: true,
  
  env: {
    NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID: process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
    NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_VARIANT_ID: process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID,
  },

  generateEtags: true,
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

*/
