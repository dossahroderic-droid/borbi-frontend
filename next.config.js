/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['fr', 'en', 'wo', 'ar'],
    defaultLocale: 'fr',
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
}

module.exports = nextConfig
