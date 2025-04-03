/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  transpilePackages: ["steamapi"],
  // experimental: {
  //   serverComponentsExternalPackages: ["steamapi"],
  // },
};

module.exports = nextConfig;
