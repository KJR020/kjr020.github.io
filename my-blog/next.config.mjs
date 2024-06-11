/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.GITHUB_ACTIONS && './KJR020.github.io',
};

export default nextConfig;
