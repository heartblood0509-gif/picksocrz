import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'www.yonhapnewstv.co.kr',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.yonhapnewstv.co.kr',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.yonhapnews.co.kr',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
