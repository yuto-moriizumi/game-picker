/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ hostname: "steamcdn-a.akamaihd.net" }] },
  experimental: {
    outputFileTracingIncludes: {
      "/": ["./node_modules/steamapi/**/*", "./node_modules/steamapi/*"],
    },
  },
};

module.exports = nextConfig;
