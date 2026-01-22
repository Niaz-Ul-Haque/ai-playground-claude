import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for S3/CloudFront deployment
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Generate trailing slashes for S3 compatibility
  trailingSlash: true,
  
  // API configuration is handled via NEXT_PUBLIC_API_BASE_URL env variable
};

export default nextConfig;
