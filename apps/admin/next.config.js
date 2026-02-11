/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@trustvibe/shared'],
};

module.exports = nextConfig;
