const nextBundleAnalyzer = require('@next/bundle-analyzer');

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'api.ts']
};

module.exports = withBundleAnalyzer(nextConfig);
