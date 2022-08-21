const nextBundleAnalyzer = require('@next/bundle-analyzer');
const path = require('path');

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'api.ts'],
  webpack: config => {
    //console.dir(config.module.rules, { depth: null });
    for (const rule of config.module.rules) {
      if (!rule.oneOf) {
        continue;
      }

      for (const loader of rule.oneOf) {
        if (!(loader.test instanceof RegExp)) {
          continue;
        }
        if (loader.test.toString() === '/\\.(tsx|ts|js|cjs|mjs|jsx)$/') {
          loader.include.push(path.resolve(__dirname, '../api-types'));
        }
      }
    }
    return config;
  }
};

module.exports = withBundleAnalyzer(nextConfig);
