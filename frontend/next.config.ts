/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // Semua request yang diawali /api/backend bakal diterusin ke AWS lu
        source: '/api/backend/:path*',
        destination: 'http://3.106.182.247:8080/:path*', // <-- GANTI PAKE IP ECS LU
      },
    ];
  },
};

export default nextConfig;