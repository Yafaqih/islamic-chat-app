/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID: process.env.LEMONSQUEEZY_PRO_VARIANT_ID,
    NEXT_PUBLIC_LEMONSQUEEZY_PREMIUM_VARIANT_ID: process.env.LEMONSQUEEZY_PREMIUM_VARIANT_ID,
  },
}

module.exports = nextConfig