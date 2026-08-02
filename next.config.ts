import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/airbnb',
        destination: '/',
        permanent: true,
      },
      {
        source: '/airbnb/login',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/airbnb/dashboard',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/airbnb/docs',
        destination: '/docs',
        permanent: true,
      },
      {
        source: '/airbnb/faq',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/airbnb/features',
        destination: '/features',
        permanent: true,
      },
      {
        source: '/airbnb/clean/:path*',
        destination: '/clean/:path*',
        permanent: true,
      },
      {
        source: '/airbnb/report/:path*',
        destination: '/report/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
