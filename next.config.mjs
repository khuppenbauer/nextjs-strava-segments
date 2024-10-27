/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    url: process.env.DIRECTUS_URL,
    token: process.env.DIRECTUS_TOKEN,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.DIRECTUS_URL.replace(/https?:\/\//, ''),
      },
    ],
  },
};

export default nextConfig;
