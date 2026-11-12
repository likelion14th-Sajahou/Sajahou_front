/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = (process.env.BACKEND_URL ?? "https://13-209-185-170.sslip.io").replace(/\/+$/, "");
    return [{
      source: "/api/v1/:path*",
      destination: `${backendUrl}/api/v1/:path*`,
    }];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
