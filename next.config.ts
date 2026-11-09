/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  // Allow leaflet CSS
  transpilePackages: ["leaflet", "react-leaflet"],
};

export default nextConfig;
