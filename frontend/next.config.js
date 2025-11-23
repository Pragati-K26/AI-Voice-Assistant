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
  // Disable static optimization that might cause prefetching issues
  output: undefined,
  // Skip build ID generation that might cause issues
  generateBuildId: undefined,
}

module.exports = nextConfig

