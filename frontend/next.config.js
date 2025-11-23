/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://ai-voice-assistant-evgf.onrender.com',
  },
  // Disable prefetching for better performance and to prevent 404 errors
  experimental: {
    optimizePackageImports: ['@/components'],
  },
}

module.exports = nextConfig

