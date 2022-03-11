/** @type {import('next').NextConfig} */
module.exports = {
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
}

