/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ hostname: "steamcdn-a.akamaihd.net" }] },
  transpilePackages: ["steamapi"],
};

module.exports = nextConfig;
