/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hashvalley.4everland.link',
        port: '',
        pathname: '/ipfs/**',
      },
    ],
  },
};

module.exports = nextConfig;
