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
}

