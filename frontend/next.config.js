/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://ai-voice-assistant-evgf.onrender.com',
  },
  // Disable static page generation for routes that don't exist
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
}

module.exports = nextConfig

