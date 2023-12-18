/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ hostname: "steamcdn-a.akamaihd.net" }] },
  webpack: (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          // nextjsはmainFields設定を尊重してくれないし、
          // moduleフィールドを優先的に参照してしまうのでここで強制的にindex.jsを参照させる
          "node-fetch": "node_modules/node-fetch/lib/index.js",
        },
      },
    };
  },
};

module.exports = nextConfig;
