/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://ai-voice-assistant-evgf.onrender.com',
  },
  // Disable prefetching completely
  experimental: {
    optimizePackageImports: ['@/components'],
  },
  // Disable static optimization to prevent prefetching
  output: 'standalone',
}

module.exports = nextConfig

