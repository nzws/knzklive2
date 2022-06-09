const nextBundleAnalyzer = require('@next/bundle-analyzer');
const path = require('path');

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
});

const injectRule = rule => {
  if (rule?.use?.loader !== 'next-swc-loader') {
    return;
  }

  const injectPath = path.resolve(__dirname, '../../packages/api-types');
  if (!rule.include.includes(injectPath)) {
    rule.include.push(injectPath);
    //console.log('rule detected', rule);
  }
};

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['page.tsx', 'api.ts'],
  webpack: config => {
    //console.dir(config.module.rules, { depth: null });
    for (const rule of config.module.rules) {
      if (rule.oneOf) {
        for (const subRule of rule.oneOf) {
          injectRule(subRule);
        }
      } else {
        injectRule(rule);
      }
    }
    return config;
  }
};

module.exports = withBundleAnalyzer(nextConfig);
