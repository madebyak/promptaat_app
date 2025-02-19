/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.deepseek.com',
      },
      {
        protocol: 'https',
        hostname: 'claude.ai',
      },
      {
        protocol: 'https',
        hostname: 'images.seeklogo.com',
      },
      {
        protocol: 'https',
        hostname: '*.seeklogo.com',
      },
      {
        protocol: 'https',
        hostname: 'seeklogo.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
    domains: ['promptaat.com'],
  },
};

module.exports = nextConfig;
