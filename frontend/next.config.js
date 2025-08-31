/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable build caching for faster builds
  experimental: {
    // Enable build cache
    buildCache: true,
  },
  
  // Optimize build performance
  swcMinify: true,
  
  // Enable compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Output configuration for better caching
  output: 'standalone',
  
  // Enable static optimization
  trailingSlash: false,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com',
  },
}

module.exports = nextConfig