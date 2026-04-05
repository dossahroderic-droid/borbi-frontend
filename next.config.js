/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['fr', 'wo', 'en', 'ar'],
    defaultLocale: 'fr',
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
}

module.exports = nextConfig
