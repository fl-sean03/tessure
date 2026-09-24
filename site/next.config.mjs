/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: { formats: ['image/avif', 'image/webp'], deviceSizes: [390, 640, 828, 1080, 1440, 1920] },
  experimental: { cpus: 2 },
}
export default nextConfig
