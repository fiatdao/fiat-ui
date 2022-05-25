const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const moduleExports = {
  reactStrictMode: false,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      issuer: {
        and: [/\.(js|ts)x?$/],
      },
      use: ['@svgr/webpack'],
    });

    return config
  },
  async redirects() {
    return [
      {
        source: "/senatus",
        permanent: true,
        destination: "https://gov.fiatdao.com/senatus"
      },
      {
        source: "/rewards",
        permanent: true,
        destination: "https://gov.fiatdao.com/rewards"
      },
      {
        source: "/age-of-romulus",
        permanent: true,
        destination: "https://gov.fiatdao.com/age-of-romulus"
      },
      {
        source: "/airdrop",
        permanent: true,
        destination: "https://gov.fiatdao.com/airdrop"
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/create-position',
      },
    ]
  },
  env: {
    commitHash: Buffer.from(require('child_process').execSync('git rev-parse --short HEAD')).toString().trim()
  },
  // Required for Fleek.io deploy
  trailingSlash: true,
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      '/': { page: '/' },
      '/create-position': { page: '/create-position' },
      '/auctions': { page: '/auctions' },
      '/404': { page: '/404' }
    }
  },
}

const sentryWebpackPluginOptions = {
  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
