/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "steamcdn-a.akamaihd.net" },
      { hostname: "cdn.akamai.steamstatic.com" },
      { hostname: "shared.akamai.steamstatic.com" },
    ],
  },
  transpilePackages: ["steamapi"],
  // experimental: {
  //   serverComponentsExternalPackages: ["steamapi"],
  // },
};

module.exports = nextConfig;
