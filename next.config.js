/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // transpilePackages: ["steamapi"],
  /** dynamoose https://github.com/dynamoose/dynamoose/issues/1617#issuecomment-1690244996 */
  serverExternalPackages: ["steamapi", "dynamoose"],
};

export default nextConfig;
